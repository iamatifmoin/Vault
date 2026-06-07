import { getAuthState, setAuthState } from "../shared/auth";
import { getAuthenticatedUser, saveProblemToGitHub } from "../shared/github";
import type { CapturedProblem, ExtensionAuthState } from "../shared/types";

console.log("Vault: background service worker started");

const recentCaptures = new Map<string, number>();
const CAPTURE_DEDUP_MS = 30_000;

interface ProblemCapturedMessage {
  type: "PROBLEM_CAPTURED";
  data: CapturedProblem;
}

interface AuthCompleteMessage {
  type: "AUTH_COMPLETE";
  token: string;
  username: string;
}

type BackgroundMessage = ProblemCapturedMessage | AuthCompleteMessage;

function showChromeNotification(title: string, message: string): void {
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon48.png"),
    title,
    message,
  });
}

async function showInPageNotification(tabId: number, message: string): Promise<void> {
  const notificationUrl = chrome.runtime.getURL(
    `notification/notification.html?message=${encodeURIComponent(message)}`,
  );

  await chrome.scripting.executeScript({
    target: { tabId },
    func: (url: string) => {
      const existing = document.getElementById("vault-notification-frame");
      existing?.remove();

      const iframe = document.createElement("iframe");
      iframe.id = "vault-notification-frame";
      iframe.src = url;
      iframe.style.cssText = [
        "position: fixed",
        "top: 16px",
        "right: 16px",
        "width: 320px",
        "height: 64px",
        "border: none",
        "z-index: 2147483647",
        "background: transparent",
        "pointer-events: none",
      ].join(";");

      document.body.appendChild(iframe);
      window.setTimeout(() => iframe.remove(), 4000);
    },
    args: [notificationUrl],
  });

  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "VAULT_NOTIFICATION",
      data: { message },
    });
  } catch {
    // Content scripts are not required to handle this message.
  }
}

function captureKey(problem: CapturedProblem): string {
  return `${problem.platform}:${problem.titleSlug}`;
}

async function handleCapture(
  problem: CapturedProblem,
  tabId?: number,
): Promise<{ ok: boolean; message: string }> {
  const auth = await getAuthState();

  if (!auth.githubToken) {
    console.warn("Vault: capture ignored because extension auth is missing.");
    showChromeNotification("Vault", "Connect your GitHub first");
    return { ok: false, message: "Connect your GitHub first" };
  }

  const key = captureKey(problem);
  const lastCapture = recentCaptures.get(key) ?? 0;
  if (Date.now() - lastCapture < CAPTURE_DEDUP_MS) {
    return { ok: true, message: "Already saved recently." };
  }

  console.log(`Vault: saving ${problem.platform} #${problem.number} ${problem.title}`);

  const result = await saveProblemToGitHub(problem, auth.githubToken);

  if (result.success) {
    recentCaptures.set(key, Date.now());

    const countResult = await chrome.storage.local.get("vault_capture_count");
    const count = (countResult.vault_capture_count ?? 0) + 1;
    await chrome.storage.local.set({ vault_capture_count: count });

    if (result.username && result.username !== auth.githubUsername) {
      await setAuthState({
        githubToken: auth.githubToken,
        githubUsername: result.username,
        vaultConnected: true,
      });
    }

    console.log("Vault:", result.message);
    if (tabId !== undefined) {
      await showInPageNotification(tabId, result.message);
    }
    return { ok: true, message: result.message };
  }

  console.error("Vault:", result.message);
  showChromeNotification("Vault", result.message);
  return { ok: false, message: result.message };
}

async function handleAuthComplete(
  token: string,
  username: string,
): Promise<ExtensionAuthState> {
  let resolvedUsername = username;

  try {
    resolvedUsername = await getAuthenticatedUser(token);
  } catch {
    // Fall back to the value provided by the web app.
  }

  const nextState: ExtensionAuthState = {
    githubToken: token,
    githubUsername: resolvedUsername,
    vaultConnected: true,
  };

  await setAuthState(nextState);
  return nextState;
}

function handleAuthCompleteMessage(
  message: AuthCompleteMessage,
  sendResponse: (response: { ok: boolean; state?: ExtensionAuthState }) => void,
): boolean {
  void handleAuthComplete(message.token, message.username).then((state) => {
    sendResponse({ ok: true, state });
  });
  return true;
}

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  if (message.type === "PROBLEM_CAPTURED") {
    void handleCapture(message.data, sender.tab?.id).then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === "AUTH_COMPLETE") {
    return handleAuthCompleteMessage(message, sendResponse);
  }

  return false;
});

chrome.runtime.onMessageExternal.addListener((message: AuthCompleteMessage, _sender, sendResponse) => {
  if (message.type === "AUTH_COMPLETE") {
    return handleAuthCompleteMessage(message, sendResponse);
  }

  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Vault extension installed");
});
