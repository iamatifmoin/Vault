import type { ExtensionAuthState } from "../shared/types";

const VAULT_CONNECT_URL = "http://localhost:3000/extension-success";
const VAULT_APP_URL = "http://localhost:3000/dashboard";
const AUTH_KEY = "vault_auth";

type PopupState = "loading" | "connected" | "disconnected";

async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function renderState(state: PopupState, auth?: ExtensionAuthState): void {
  const loadingEl = document.getElementById("state-loading");
  const connectedEl = document.getElementById("state-connected");
  const disconnectedEl = document.getElementById("state-disconnected");
  if (!loadingEl || !connectedEl || !disconnectedEl) return;

  loadingEl.hidden = state !== "loading";
  connectedEl.hidden = state !== "connected";
  disconnectedEl.hidden = state !== "disconnected";

  if (state === "connected" && auth?.githubUsername) {
    const usernameEl = document.getElementById("username");
    const captureCountEl = document.getElementById("capture-count");
    if (usernameEl) usernameEl.textContent = auth.githubUsername;
    if (captureCountEl) {
      void chrome.storage.local.get("vault_capture_count").then((res) => {
        captureCountEl.textContent = String(res.vault_capture_count ?? 0);
      });
    }
  }
}

async function initPopup(): Promise<void> {
  renderState("loading");

  try {
    const result = await chrome.storage.local.get(AUTH_KEY);
    const auth = result[AUTH_KEY] as ExtensionAuthState | undefined;

    if (auth?.githubToken && auth?.githubUsername) {
      const isValid = await verifyToken(auth.githubToken);
      if (isValid) {
        renderState("connected", auth);
      } else {
        await chrome.storage.local.remove(AUTH_KEY);
        renderState("disconnected");
      }
    } else {
      renderState("disconnected");
    }
  } catch {
    renderState("disconnected");
  }
}

function setupActions(): void {
  document.getElementById("connect")?.addEventListener("click", () => {
    void chrome.tabs.create({ url: VAULT_CONNECT_URL });
  });

  document.getElementById("open-vault")?.addEventListener("click", () => {
    void chrome.tabs.create({ url: VAULT_APP_URL });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupActions();
  void initPopup();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void initPopup();
});
