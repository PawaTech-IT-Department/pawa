// profile.js - Profile page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchProfile();
  setupEditProfileHandler();
});

let currentProfile = null;

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
  currentProfile = profile;
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

function setupEditProfileHandler() {
  document.querySelector(".edit-button").addEventListener("click", function () {
    showEditProfileModal();
  });
}

function showEditProfileModal() {
  // Create modal if not present
  if (!document.getElementById("editProfileModal")) {
    const modal = document.createElement("div");
    modal.id = "editProfileModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <h3>Edit Profile</h3>
        <form id="editProfileForm">
          <div class="form-group">
            <label for="editProfileName">Name:</label>
            <input type="text" id="editProfileName" required />
          </div>
          <div class="form-group">
            <label for="editProfileEmail">Email:</label>
            <input type="email" id="editProfileEmail" required />
          </div>
          <div class="form-group">
            <label for="editProfilePhone">Phone:</label>
            <input type="text" id="editProfilePhone" required />
          </div>
          <div class="form-group">
            <label for="editProfileBio">Bio:</label>
            <textarea id="editProfileBio" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit">Save</button>
            <button type="button" id="cancelEditProfile">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Fill form with current profile
  document.getElementById("editProfileName").value = currentProfile.name;
  document.getElementById("editProfileEmail").value = currentProfile.email;
  document.getElementById("editProfilePhone").value = currentProfile.phone;
  document.getElementById("editProfileBio").value = currentProfile.bio;
  // Show modal
  document.getElementById("editProfileModal").style.display = "block";
  // Close modal
  document.getElementById("cancelEditProfile").addEventListener("click", function () {
    document.getElementById("editProfileModal").style.display = "none";
    document.getElementById("editProfileForm").reset();
  });
  // Form submit
  document.getElementById("editProfileForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    await saveProfile();
  });
}

async function saveProfile() {
  const name = document.getElementById("editProfileName").value;
  const email = document.getElementById("editProfileEmail").value;
  const phone = document.getElementById("editProfilePhone").value;
  const bio = document.getElementById("editProfileBio").value;
  const payload = { name, email, phone, bio };
  try {
    // Replace with real API call
    // const res = await fetch("/api/profile", {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload)
    // });
    // const data = await res.json();
    // if (!res.ok) throw new Error(data.error || "Failed to update profile");
    // For demo, update local profile
    currentProfile = { ...currentProfile, ...payload };
    renderProfile(currentProfile);
    document.getElementById("editProfileModal").style.display = "none";
    document.getElementById("editProfileForm").reset();
  } catch (err) {
    alert("Error updating profile: " + err.message);
  }
}
