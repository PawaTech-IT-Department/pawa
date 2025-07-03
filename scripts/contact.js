document.addEventListener("DOMContentLoaded", function () {
  // --- Contact Form ---
  const contactForm = document.querySelector(".contact--form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      if (name && email && message) {
        // Here you would typically send the form data to a server and return an alert
        alert("Thank you for your message! We will get back to you soon.");
        contactForm.reset(); // Clear the form fields
      } else { // if any of the required field is missing, this alert shall pop-up
        alert("Please fill out all the fields before sending your message.");
      }
    });
  }

  // --- "Get in Touch" Section ---
  const emailLink = document.querySelector('a[href="mailto:pawatech56@gmail.com"]');
  if (emailLink) {
    emailLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "mailto:pawatech56@gmail.com";
    });
  }

  const phoneLink = document.querySelector('a[href="tel:+254748881679"]'); //I am not sure if the contact number is correct, that's why it got a comment here
  if (phoneLink) {
    phoneLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "tel:+254748881679";
    });
  }

  // --- Social Media Icons ---
  const socialIcons = document.querySelectorAll(".social--icon");
  if (socialIcons) {
    socialIcons.forEach((icon) => {
      icon.addEventListener("click", function (event) {
        event.preventDefault();
        const socialNetwork = this.getAttribute("aria-label");
        let destination = "/"; // Default destination

        switch (socialNetwork) { //at this point, we need to create accounts for the respective networks 
          case "Instagram":
            destination = "https://www.instagram.com";
            break;
          case "LinkedIn":
            destination = "https://www.linkedin.com";
            break;
          case "Twitter":
            destination = "https://www.twitter.com";
            break;
          case "Facebook":
            destination = "https://www.facebook.com";
            break;
          case "Whatsapp":
            destination = "https://wa.me/254748881679";
            break;
        }
        window.open(destination, "_blank"); // Open in a new tab
      });
    });
  }

  // --- Immediate Help Buttons ---
  const callNowButton = document.querySelector(".btn--primary .fa-phone");
  if (callNowButton) {
    const callNowAnchor = callNowButton.parentElement;
    callNowAnchor.setAttribute("href", "tel:+254748881679");
  }

  const liveChatButton = document.querySelector(".btn--secondary .fa-comments");// talking about live chat,,what progress is made on the bot?! 
  if (liveChatButton) {
    const liveChatAnchor = liveChatButton.parentElement;
    // Replace '#' with your actual live chat link or function. I guess this should be in the .html file, right?!
    liveChatAnchor.addEventListener("click", function (event) {
      event.preventDefault();
      // Example: Open a live chat widget
      alert("Opening live chat...");// Or, for example, if you have a specific URL for live chat:
      // window.open('https://your-live-chat-provider.com/chat', '_blank');
    });
  }
});
