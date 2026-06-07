import { clearAuth } from "../shared/auth";
import type { ExtensionAuthState } from "../shared/types";

const VAULT_CONNECT_URL = "https://vaultbyatif.vercel.app/extension-success";
const VAULT_APP_URL = "https://vaultbyatif.vercel.app/dashboard";
const AUTH_KEY = "vault_auth";

type PopupState = "loading" | "connected" | "disconnected";

interface RecentCapture {
  title: string;
  date: string;
  platform: string;
}

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

function renderRecentCaptures(recent: RecentCapture[]): void {
  const list = document.getElementById("recent-list");
  if (!list) return;

  list.innerHTML = "";

  if (recent.length === 0) {
    list.innerHTML =
      '<li class="recent-item"><span class="recent-item-title recent-item-title--empty">No captures yet — solve a problem!</span></li>';
    return;
  }

  recent.slice(0, 3).forEach((item) => {
    const li = document.createElement("li");
    li.className = "recent-item";
    const date = new Date(item.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    li.innerHTML = `
      <span class="recent-item-title">${item.title}</span>
      <span class="recent-item-date">${date}</span>
    `;
    list.appendChild(li);
  });
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

    void chrome.storage.local.get("vault_recent_captures").then((res) => {
      const recent = (res.vault_recent_captures ?? []) as RecentCapture[];
      renderRecentCaptures(recent);
    });

    const avatarEl = document.getElementById("user-avatar") as HTMLImageElement | null;
    if (avatarEl && auth.githubUsername) {
      avatarEl.src = `https://github.com/${auth.githubUsername}.png?size=72`;
      avatarEl.alt = auth.githubUsername;
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
  document.getElementById("connect-btn")?.addEventListener("click", () => {
    void chrome.tabs.create({ url: VAULT_CONNECT_URL });
  });

  document.getElementById("settings-btn")?.addEventListener("click", () => {
    void chrome.tabs.create({ url: VAULT_APP_URL });
  });

  document.getElementById("disconnect-btn")?.addEventListener("click", () => {
    void clearAuth().then(() => {
      renderState("disconnected");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupActions();
  void initPopup();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void initPopup();
});
