// settings.js - Settings page logic

document.addEventListener("DOMContentLoaded", function () {
  loadSettings();
  document.querySelector(".settings-form")?.addEventListener("submit", saveSettings);
  document.querySelector(".settings-form")?.addEventListener("reset", resetSettings);
});

function loadSettings() {
  // Simulate loading settings from localStorage or backend
  const settings = JSON.parse(localStorage.getItem("adminSettings") || "{}");
  document.querySelectorAll(".settings-form input[type='checkbox']").forEach((cb, i) => {
    cb.checked = settings[`cb${i}`] ?? cb.defaultChecked;
  });
  document.querySelectorAll(".settings-form select").forEach((sel, i) => {
    sel.value = settings[`sel${i}`] ?? sel.value;
  });
  document.querySelectorAll(".settings-form input[type='text']").forEach((inp, i) => {
    inp.value = settings[`inp${i}`] ?? inp.value;
  });
}

function saveSettings(e) {
  e.preventDefault();
  const settings = {};
  document.querySelectorAll(".settings-form input[type='checkbox']").forEach((cb, i) => {
    settings[`cb${i}`] = cb.checked;
  });
  document.querySelectorAll(".settings-form select").forEach((sel, i) => {
    settings[`sel${i}`] = sel.value;
  });
  document.querySelectorAll(".settings-form input[type='text']").forEach((inp, i) => {
    settings[`inp${i}`] = inp.value;
  });
  localStorage.setItem("adminSettings", JSON.stringify(settings));
  alert("Settings saved!");
}

function resetSettings() {
  localStorage.removeItem("adminSettings");
  setTimeout(() => loadSettings(), 100);
}
