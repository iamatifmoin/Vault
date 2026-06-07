const params = new URLSearchParams(window.location.search);
const message = params.get("message") ?? "Solution saved to Vault";

const messageEl = document.getElementById("message");
if (messageEl) {
  messageEl.textContent = message;
}
