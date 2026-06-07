interface NotificationData {
  type?: "SHOW_NOTIFICATION";
  title: string;
  titleSlug: string;
  approach?: string;
}

const DISMISS_MS = 4000;

function approachClass(approach: string): string {
  if (approach === "Optimal") return "optimal";
  if (approach === "Optimized") return "optimized";
  return "brute-force";
}

function dismissNotification(): void {
  const el = document.getElementById("vault-notification");
  if (!el) return;

  el.classList.add("vault-exiting");
  window.setTimeout(() => {
    el.remove();
    window.parent.postMessage({ type: "VAULT_NOTIFICATION_DISMISS" }, "*");
  }, 300);
}

function showNotification(data: NotificationData): void {
  const subtitleEl = document.getElementById("vault-notif-problem");
  const analyzeEl = document.getElementById("vault-notif-analyze") as HTMLAnchorElement | null;
  const approachEl = document.getElementById("vault-notif-approach");
  const closeEl = document.getElementById("vault-notif-close");

  if (!subtitleEl || !analyzeEl || !approachEl || !closeEl) return;

  subtitleEl.textContent = data.title;
  analyzeEl.href = `https://vaultbyatif.vercel.app/library/${data.titleSlug}`;

  if (data.approach) {
    approachEl.textContent = data.approach;
    approachEl.className = `vault-notif-badge ${approachClass(data.approach)}`;
    approachEl.hidden = false;
  } else {
    approachEl.textContent = "";
    approachEl.className = "vault-notif-badge";
    approachEl.hidden = true;
  }

  const timer = window.setTimeout(() => dismissNotification(), DISMISS_MS);

  closeEl.onclick = () => {
    window.clearTimeout(timer);
    dismissNotification();
  };
}

function dataFromParams(): NotificationData | null {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const titleSlug = params.get("titleSlug");

  if (!title || !titleSlug) return null;

  return {
    title,
    titleSlug,
    approach: params.get("approach") ?? undefined,
  };
}

window.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    showNotification(event.data as NotificationData);
  }
});

const initialData = dataFromParams();
if (initialData) {
  showNotification(initialData);
}
