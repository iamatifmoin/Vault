import { getAuthState } from "../shared/auth";

const VAULT_CONNECT_URL = "http://localhost:3000/extension-success";

async function initPopup(): Promise<void> {
  const statusEl = document.getElementById("status");
  const connectEl = document.getElementById("connect");
  if (!statusEl || !connectEl) return;

  const auth = await getAuthState();

  if (auth.vaultConnected && auth.githubUsername) {
    statusEl.textContent = `Connected as ${auth.githubUsername}`;
    connectEl.hidden = true;
    return;
  }

  statusEl.textContent = "Not connected — sign in to Vault to link your account";
  connectEl.hidden = false;
  connectEl.addEventListener("click", () => {
    void chrome.tabs.create({ url: VAULT_CONNECT_URL });
  });
}

void initPopup();
