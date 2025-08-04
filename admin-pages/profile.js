// profile.js - Profile page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchProfile();
});

async function fetchProfile() {
  // Simulate fetching profile from backend (replace with real API if available)
  // Example static data:
  const profile = {
    name: "Wangechi Cynthia",
    email: "admin@example.com",
    role: "Super Admin",
    phone: "+254 712 345 678",
    bio: "Passionate about system efficiency and clean UX design.",
    image: "profile.jpg",
    stats: [112, 24, 3],
    activities: [
      { text: "✅ Completed dashboard redesign", time: "2 hours ago" },
      { text: "➕ Added new user", time: "Yesterday" },
      { text: "⚙️ Updated server settings", time: "2 days ago" },
    ],
    tags: ["UX Design", "Project Management", "Team Leadership"],
  };
  renderProfile(profile);
}

function renderProfile(profile) {
  document.querySelector(".profile-image").src = profile.image;
  document.querySelector(".profile-name").textContent = profile.name;
  document.querySelector(".profile-details").innerHTML = `
    <p><strong>Email:</strong> ${profile.email}</p>
    <p><strong>Role:</strong> ${profile.role}</p>
    <p><strong>Phone:</strong> ${profile.phone}</p>
    <p><strong>Bio:</strong> ${profile.bio}</p>
  `;
  // Stats
  const stats = document.querySelectorAll(".stat-card h3");
  if (stats.length === 3) {
    stats[0].textContent = profile.stats[0];
    stats[1].textContent = profile.stats[1];
    stats[2].textContent = profile.stats[2];
  }
  // Activities
  const activityList = document.querySelector(".activity-list");
  if (activityList) {
    activityList.innerHTML = profile.activities.map(a => `<li>${a.text} — <span>${a.time}</span></li>`).join("");
  }
  // Tags
  const tagsContainer = document.querySelector(".tags-container");
  if (tagsContainer) {
    tagsContainer.innerHTML = profile.tags.map(tag => `<span class="tag">${tag}</span>`).join("");
  }
}
