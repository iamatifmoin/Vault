import type { ExtensionAuthState } from "./types";

const AUTH_KEY = "vault_auth";

const defaultAuthState: ExtensionAuthState = {
  githubToken: null,
  githubUsername: null,
  vaultConnected: false,
};

export async function getAuthState(): Promise<ExtensionAuthState> {
  const result = await chrome.storage.local.get(AUTH_KEY);
  return (result[AUTH_KEY] as ExtensionAuthState | undefined) ?? defaultAuthState;
}

export async function setAuthState(state: ExtensionAuthState): Promise<void> {
  await chrome.storage.local.set({ [AUTH_KEY]: state });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.local.remove(AUTH_KEY);
}
