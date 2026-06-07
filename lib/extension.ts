export type ExtensionConnectionStatus =
  | "checking"
  | "connected"
  | "disconnected"
  | "not-installed"
  | "unavailable";

export interface ExtensionStatus {
  status: ExtensionConnectionStatus;
  username?: string | null;
}

interface ChromeRuntime {
  sendMessage: (
    extensionId: string,
    message: unknown,
    responseCallback?: (response: unknown) => void,
  ) => void;
  lastError?: { message?: string };
}

function getChromeRuntime(): ChromeRuntime | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { chrome?: { runtime?: ChromeRuntime } }).chrome
    ?.runtime;
}

function getExtensionId(): string | undefined {
  return process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID;
}

export function queryExtensionStatus(): Promise<ExtensionStatus> {
  return new Promise((resolve) => {
    const runtime = getChromeRuntime();
    const extensionId = getExtensionId();

    if (!runtime?.sendMessage || !extensionId) {
      resolve({ status: "unavailable" });
      return;
    }

    try {
      runtime.sendMessage(
        extensionId,
        { type: "GET_STATUS" },
        (response) => {
          if (runtime.lastError?.message) {
            const message = runtime.lastError.message.toLowerCase();
            if (
              message.includes("could not establish connection") ||
              message.includes("receiving end does not exist")
            ) {
              resolve({ status: "not-installed" });
              return;
            }

            resolve({ status: "disconnected" });
            return;
          }

          const result = response as
            | { ok?: boolean; connected?: boolean; username?: string | null }
            | undefined;

          if (result?.ok && result.connected) {
            resolve({
              status: "connected",
              username: result.username,
            });
            return;
          }

          resolve({ status: "disconnected" });
        },
      );
    } catch {
      resolve({ status: "unavailable" });
    }
  });
}

export function notifyExtension(
  token: string,
  username: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const runtime = getChromeRuntime();
    const extensionId = getExtensionId();

    if (!runtime?.sendMessage || !extensionId) {
      resolve(false);
      return;
    }

    try {
      runtime.sendMessage(
        extensionId,
        { type: "AUTH_COMPLETE", token, username },
        (response) => {
          if (runtime.lastError?.message) {
            resolve(false);
            return;
          }

          resolve(Boolean((response as { ok?: boolean } | undefined)?.ok));
        },
      );
    } catch {
      resolve(false);
    }
  });
}

export function getExtensionStoreUrl(): string | undefined {
  const extensionId = getExtensionId();
  if (!extensionId) return undefined;
  return `https://chrome.google.com/webstore/detail/vault/${extensionId}`;
}
