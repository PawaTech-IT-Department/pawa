// HEADER START
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      menuToggle.classList.toggle("open");
    });

    // Optional: Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.classList.remove("open");
      });
    });
  }
});
// HEADER END

// DARK MODE FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".dark-mode-toggle");
  const toggleIcon = toggleButton ? toggleButton.querySelector("img") : null;

  if (toggleButton && toggleIcon) {
    let isDark = false; // Initial state is light mode

    // Define light mode variables (should ideally match your :root defaults)
    const lightModeVariables = {
      "--bg-light": "#ffffff",
      "--bg-soft": "#f9fafb" /* A very light gray for sections */,
      "--bg-dark": "#111827" /* Dark background for footer, etc. */,
      "--text-dark": "#1f2937",
      "--text-light": "#f9fafb",
      "--text-muted": "#6b7280",
      "--border-color": "#e5e7eb",
      "--primary-color": "#6366f1",
      "--secondary-color": "#8b5cf6",
      "--accent-color": "#06b6d4",
    };

    // Dark mode variables (using a pastel/glassmorphism theme as previously discussed)
    // These should ideally come from a body.dark-mode class or a dedicated :root selector
    // for dark mode in CSS, but for JS dynamic application, we define them here.
    const darkModeVariables = {
      "--bg-light": "#1a1825" /* Deep, soft purple-black */,
      "--bg-soft":
        "rgba(40, 36, 61, 0.6)" /* Translucent pastel purple for glass effect */,
      "--bg-dark": "#0a0913" /* Even darker for footer in dark mode */,
      "--text-dark": "#e5e7eb" /* Light text for dark backgrounds */,
      "--text-light":
        "#1a1825" /* Dark text for light elements within dark mode (if any) */,
      "--text-muted": "#9ca3af" /* Softer muted text for dark mode */,
      "--border-color": "rgba(139, 92, 246, 0.2)" /* Soft purple border */,
      "--primary-color": "#8b5cf6" /* Purple as primary in dark mode */,
      "--secondary-color": "#6366f1" /* Indigo as secondary in dark mode */,
      "--accent-color": "#06b6d4" /* Cyan can remain or be adjusted */,
    };

    // Function to apply theme variables
    const applyTheme = (theme) => {
      for (const [variable, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(variable, value);
      }
    };

    // Apply initial light mode styles on page load
    applyTheme(lightModeVariables);

    // Toggle event listener
    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      isDark = !isDark;

      // Update icon and alt text
      toggleIcon.src = isDark
        ? "/img/icons/light-mode.png" // Assuming you have a light mode sun icon
        : "/img/icons/dark-mode.png"; // Your default dark mode moon icon
      toggleIcon.alt = isDark ? "light mode toggle" : "dark mode toggle";

      // Apply the selected mode's variables
      const mode = isDark ? darkModeVariables : lightModeVariables;
      applyTheme(mode);

      // Optional: Add/remove a class to the body for CSS-based theme adjustments
      // If you primarily control with JS, this might be less critical, but good for
      // global styling changes not directly tied to individual vars.
      document.body.classList.toggle("dark-mode", isDark);
    });
  }
});
