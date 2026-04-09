const loaderEl = document.getElementById("loader");
const titleGroup = document.getElementById("title-group");
const hintText = document.getElementById("hint-text");

export function showScene() {
  // Hide spinner
  loaderEl.classList.add("hidden");

  // Fade in title + subtitle + hint (CSS transitions handle stagger)
  requestAnimationFrame(() => {
    titleGroup.classList.add("visible");
  });

  // Dismiss hint after 5 seconds
  setTimeout(() => {
    hintText.classList.add("dismissed");
  }, 5000);
}
