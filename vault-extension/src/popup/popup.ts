import { getAuthState } from "../shared/auth";

async function initPopup(): Promise<void> {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;

  const auth = await getAuthState();

  if (auth.vaultConnected && auth.githubUsername) {
    statusEl.textContent = `Connected as ${auth.githubUsername}`;
  } else {
    statusEl.textContent = "Not connected — open Vault to link your account";
  }
}

void initPopup();
