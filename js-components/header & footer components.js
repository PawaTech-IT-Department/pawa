class MainHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
     <header class="main--header">
  <div class="header--container">
    <nav class="main--nav">
      <a href="/" class="logo">
        <img src="/img/icons/Neszi logo.png" />
        <span>Neszi Supply Hub</span>
      </a>
      <ul class="nav--links" id="navLinks">
        <li><a href="/index.html">Home</a></li>
        <li><a href="/pages/shop.html">Shop</a></li>
        <li><a href="/pages/about.html">About</a></li>
        <li><a href="/pages/contact.html">Contact</a></li>
      </ul>
      <div class="nav--actions">
        <a href="/pages/cart.html" class="cart--link icon--button">
          <img src="/img/icons/shopping-cart.png" alt="Shopping cart" />
          <span class="cart--count js-cart-quantity" style='opacity:0;'>0</span>
        </a>
        <a
          href="#"
          class="dark-mode-toggle icon--button"
          aria-label="Toggle Dark Mode"
        >
          <img src="/img/icons/dark-mode.png" alt="darkmode" />
        </a>
      </div>
      <div class="menu-toggle" id="menuToggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  </div>
</header>
    `;

    // Toggle the active class
    const links = this.querySelectorAll(".nav--links a");
    const currentPath = window.location.pathname.replace(/^\/+/, "");

    links.forEach((link) => {
      const linkPath = link.getAttribute("href").replace(/^\/+/, "");
      const isActive =
        (linkPath === "" && currentPath === "index.html") ||
        (linkPath !== "" && currentPath.endsWith(linkPath));
      link.classList.toggle("active", isActive);
    });
  }
}
customElements.define("main-header", MainHeader);

//Footer
class MainFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="main--footer">
        <div class="footer--container">
          <div class="footer--grid">
            <div class="footer--column">
              <a href="/" class="logo footer--logo">
                <img
                  src="/img/icons/Neszi logo.png"
                  alt=""
                  id="footer--logo--icon"
                />
                <span>Neszi</span>
              </a>
              <p>
                Your trusted partner for premium electronics and computers with
                exceptional service.
              </p>
              <div class="footer--socialLinks">
                <a href="/" aria-label="Twitter">
                  <img src="/img/icons/twitter-squared.png" alt="Twitter icon" />
                </a>
                <a href="/" aria-label="Facebook">
                  <img src="/img/icons/facebook.png" alt="Facebook icon" />
                </a>
                <a href="/" aria-label="Instagram">
                  <img src="/img/icons/instagram.png" alt="Instagram icon" />
                </a>
              </div>
            </div>
            <div class="footer--column">
              <h4>Shop</h4>
              <ul>
                <li><a href="#">Computers</a></li>
                <li><a href="#">Printers</a></li>
                <li><a href="#">Projectors</a></li>
                <li><a href="#">Tablets</a></li>
                <li><a href="#">Refuribished</a></li>
              </ul>
            </div>
            <div class="footer--column">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Returns</a></li>
                <li><a href="#">Warranty</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
            <div class="footer--column">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 Neszi Electronics. All rights reserved.</p>
          </div>
        </div>
        <button id="backToTopBtn" title="Go to top">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
            <span class="sr-only">Back to Top</span>
        </button>
      </footer>
    `;

    this.setupBackToTopButton();
  }

  setupBackToTopButton() {
    const backToTopBtn = this.querySelector("#backToTopBtn");

    // Show/hide the button based on scroll position
    const handleScroll = () => {
      if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopBtn.style.display = "flex"; // Use flex to center SVG and text if you keep the span
      } else {
        backToTopBtn.style.display = "none";
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check in case the user loads the page already scrolled down
    handleScroll();

    // Scroll to top on button click
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}

customElements.define("main-footer", MainFooter);
