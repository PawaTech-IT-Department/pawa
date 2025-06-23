// DARK MODE TO BE FIXED
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".dark-mode-toggle img");
  if (toggle && toggle.parentElement) {
    let isDark = false;

    // Light mode variables (default values from :root)
    const lightMode = {
      "--bg-light": "#ffffff",
      "--bg-content": "#ffffff",
      "--text-light": "#1f2937",
      "--text-secondary": "#6b7280",
      "--border-color": "#e5e7eb",
    };

    // Dark mode variables (from the provided body.dark-mode block)
    const darkMode = {
      " --bg-light:": "#1a1825",
      "--bg-content": "rgba(40, 36, 61, 0.6)",
      "--text-light": "#e5e7eb",
      "--text-secondary": "#9ca3af",
      "--border-color": "rgba(139, 92, 246, 0.2)",
    };

    // Set initial light mode styles on page load
    for (const [variable, value] of Object.entries(lightMode)) {
      document.documentElement.style.setProperty(variable, value);
    }

    // Toggle event listener
    toggle.parentElement.addEventListener("click", (e) => {
      e.preventDefault();
      isDark = !isDark;
      toggle.src = isDark
        ? "/img/icons/light-mode.png"
        : "/img/icons/dark-mode.png";
      toggle.alt = isDark ? "lightmode" : "darkmode";

      // Apply the selected mode's variables
      const mode = isDark ? darkMode : lightMode;
      for (const [variable, value] of Object.entries(mode)) {
        document.documentElement.style.setProperty(variable, value);
      }
    });
  }
});
