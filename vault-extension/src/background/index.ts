import { getAuthState, setAuthState } from "../shared/auth";
import { saveProblemToGitHub } from "../shared/github";
import type { CapturedProblem, ExtensionAuthState } from "../shared/types";

console.log("Vault: background service worker started");

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

async function handleCapture(problem: CapturedProblem, tabId?: number): Promise<void> {
  const auth = await getAuthState();

  if (!auth.githubToken || !auth.githubUsername) {
    showChromeNotification("Vault", "Connect your GitHub first");
    return;
  }

  const result = await saveProblemToGitHub(
    problem,
    auth.githubToken,
    auth.githubUsername,
  );

  if (result.success) {
    if (tabId !== undefined) {
      await showInPageNotification(tabId, result.message);
    }
    return;
  }

  showChromeNotification("Vault", result.message);
}

async function handleAuthComplete(
  token: string,
  username: string,
): Promise<ExtensionAuthState> {
  const nextState: ExtensionAuthState = {
    githubToken: token,
    githubUsername: username,
    vaultConnected: true,
  };

  await setAuthState(nextState);
  return nextState;
}

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  if (message.type === "PROBLEM_CAPTURED") {
    void handleCapture(message.data, sender.tab?.id).then(() => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message.type === "AUTH_COMPLETE") {
    void handleAuthComplete(message.token, message.username).then((state) => {
      sendResponse({ ok: true, state });
    });
    return true;
  }

  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Vault extension installed");
});
