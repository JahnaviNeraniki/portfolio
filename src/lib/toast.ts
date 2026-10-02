// A single shared notification (uses the .toast styles in global.css).
let timer = 0;

export function showToast(message: string, durationMs = 2500): void {
  let toast = document.getElementById("site-toast");
  const created = !toast;
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "site-toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.append(toast);
  }
  const region = toast;
  // A brand-new live region needs a frame in the DOM before screen readers announce changes.
  const write = () => {
    region.textContent = message;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => (region.textContent = ""), durationMs);
  };
  if (created) requestAnimationFrame(write);
  else write();
}
