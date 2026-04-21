const loaderEl = document.getElementById("loader");
const titleGroup = document.getElementById("title-group");
const hintText = document.getElementById("hint-text");
const landscapeHint = document.getElementById("landscape-hint");

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

/**
 * Called from animate loop with current transition progress (0..1).
 * Fades title out as we enter landscape, shows landscape hint when arrived.
 */
export function updateOverlay(progress) {
  if (progress > 0.05) {
    titleGroup.classList.add("fading");
  } else {
    titleGroup.classList.remove("fading");
  }

  if (progress > 0.95) {
    landscapeHint.classList.add("visible");
  } else {
    landscapeHint.classList.remove("visible");
  }
}
