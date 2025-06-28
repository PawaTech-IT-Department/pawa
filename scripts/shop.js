import { products } from "../data/products.js"; // Ensure this path is correct

console.log("shop.js started loading."); // DEBUG: Log 1

// --- Global State Variables ---
const productsPerPage = 9;
let currentPage = 1;
let currentSearchTerm = "";
let currentSortOrder = "popular";

// Filter state variables
let currentCategoryFilter = "all"; // Default: 'all' products selected
let minPriceFilter = 0; // Will be set dynamically from products data
let maxPriceFilter = 200000; // Will be set dynamically from products data

// Global variables for min/max product prices, to be calculated
let minProductPriceCents;
let maxProductPriceCents;

// This array will hold the products after applying all filters and sorting
let displayedProducts = []; // Initialize as empty, populated after products check

// Initialize cart array from local storage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- Helper Functions (Cart Management) ---
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId, quantityToAdd = 1) {
  let matchingItem;
  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += quantityToAdd;
  } else {
    cart.push({
      productId: productId,
      quantity: quantityToAdd,
    });
  }
  saveCartToLocalStorage();
  console.log(
    `DEBUG: Product ${productId} added to cart with quantity ${quantityToAdd}.`
  ); // DEBUG: Log 3
}

function updateCartQuantity() {
  const cartQuantityElement = document.querySelector(".js-cart-quantity");
  if (!cartQuantityElement) {
    console.warn(
      "Element with class .js-cart-quantity not found. Make sure it exists in your HTML (likely in your header component)."
    );
    return;
  }

  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });
  cartQuantityElement.textContent = totalQuantity;
  console.log("DEBUG: Total cart quantity:", totalQuantity); // DEBUG
}

// --- Product Rendering ---
const renderProductsForPage = function (page) {
  console.log("DEBUG: Rendering products for page:", page); // DEBUG
  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToDisplay = displayedProducts.slice(startIndex, endIndex);

  let productHTML = "";

  if (productsToDisplay.length === 0) {
    productHTML =
      '<p style="text-align: center; margin-top: 50px; font-size: 1.2rem; color: var(--text-muted);">No products found matching your criteria.</p>';
  } else {
    productsToDisplay.forEach((product) => {
      const fullStars = Math.floor(product.rating.stars);
      const halfStar = product.rating.stars % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      let starsHTML = "";
      for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
      }
      if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
      }
      for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
      }

      productHTML += `
          <div class="product--card">
            <img
              src="/img/${product.image.slice(7)}"
              alt="${product.name}"
            />
            <h4 class="product--name">${product.name}</h4>
            <div class="product--rating">
              ${starsHTML} <span>(${product.rating.count})</span>
            </div>
            <div class="product--quantity--container">
              <select class="js-quantity-selector" data-product-id="${
                product.id
              }">
                <option selected value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            <div class="product--price">$${(product.priceCents / 100).toFixed(
              2
            )}</div>
            <button class="btn btn--primary add-to-cart js-add-to-cart" data-product-id="${
              product.id
            }">Add to Cart</button>
          </div>
        `;
    });
  }

  const productGrid = document.querySelector(".js--product--grid");
  if (productGrid) {
    productGrid.innerHTML = productHTML;
  }

  // THIS IS THE LINE THAT WAS CAUSING THE ERROR IF FUNCTION WAS OUT OF SCOPE
  attachAddToCartListeners(); // Re-attach listeners after new products are rendered
};

// --- Pagination Rendering ---
const renderPagination = function () {
  console.log("DEBUG: Rendering pagination."); // DEBUG
  const totalPages = Math.ceil(displayedProducts.length / productsPerPage);
  const paginationContainer = document.querySelector(
    ".js-pagination-container"
  );
  let paginationHTML = "";

  if (totalPages <= 1 && displayedProducts.length > 0) {
    paginationContainer.innerHTML = "";
    return;
  }
  if (displayedProducts.length === 0) {
    paginationContainer.innerHTML = "";
    return;
  }

  paginationHTML += `<a href="#" class="js-pagination-link ${
    currentPage === 1 ? "disabled" : ""
  }" data-page="${currentPage > 1 ? currentPage - 1 : 1}">&lt;</a>`;

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `<a href="#" class="js-pagination-link ${
      i === currentPage ? "active" : ""
    }" data-page="${i}">${i}</a>`;
  }

  paginationHTML += `<a href="#" class="js-pagination-link ${
    currentPage === totalPages ? "disabled" : ""
  }" data-page="${
    currentPage < totalPages ? currentPage + 1 : totalPages
  }">&gt;</a>`;

  paginationContainer.innerHTML = paginationHTML;
  attachPaginationListeners(); // Re-attach listeners for new pagination links
};

function attachPaginationListeners() {
  console.log("DEBUG: Attaching Pagination Listeners."); // DEBUG
  document.querySelectorAll(".js-pagination-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const newPage = Number(e.target.dataset.page);
      if (newPage !== currentPage && !e.target.classList.contains("disabled")) {
        currentPage = newPage;
        renderProductsForPage(currentPage);
        renderPagination();
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
      }
    });
  });
}

// Function defined at the top level so it's accessible globally
function attachAddToCartListeners() {
  console.log("DEBUG: Attaching Add to Cart Listeners."); // DEBUG
  const allAddToCartButtons = document.querySelectorAll(".js-add-to-cart");

  allAddToCartButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const productId = button.dataset.productId;
      const quantitySelector = document.querySelector(
        `.js-quantity-selector[data-product-id="${productId}"]`
      );
      if (!quantitySelector) {
        console.warn(`Quantity selector not found for productId: ${productId}`);
        return;
      }
      const quantity = Number(quantitySelector.value);

      addToCart(productId, quantity);
      updateCartQuantity();
    });
  });
}

// --- Helper for Category Matching (Reusable) ---
function isProductInCategory(product, category) {
  if (!product.keywords) return false;

  const categoryLower = category.toLowerCase();

  // Special handling for 'all'
  if (categoryLower === "all") {
    return true;
  }

  return product.keywords.some((keyword) => {
    const keywordLower = keyword.toLowerCase();

    // Direct matches or common variations
    if (keywordLower === categoryLower) return true;
    if (categoryLower === "laptops" && keywordLower.includes("laptop"))
      return true;
    if (categoryLower === "printers" && keywordLower.includes("printer"))
      return true;
    if (categoryLower === "projectors" && keywordLower.includes("projector"))
      return true;

    // More comprehensive check for 'accessories'
    if (
      categoryLower === "accessories" &&
      (keywordLower.includes("accessory") ||
        keywordLower.includes("accessories") ||
        // List common accessory keywords from your products.js
        [
          "mouse",
          "keyboard",
          "headphones",
          "hub",
          "ssd",
          "docking station",
          "adapter",
          "cable",
          "charger",
          "stand",
          "protector",
          "cooler",
          "power bank",
          "webcam",
          "glasses",
          "chair",
          "monitor",
        ].includes(keywordLower))
    ) {
      return true;
    }
    return false;
  });
}

// --- Function to Update Category Counts ---
function updateCategoryCounts() {
  console.log("DEBUG: Updating category counts.");
  const categoryCounts = {
    all: 0,
    laptops: 0,
    printers: 0,
    projectors: 0,
    accessories: 0,
  };

  products.forEach((product) => {
    categoryCounts.all++; // Every product counts for 'all'

    if (isProductInCategory(product, "laptops")) {
      categoryCounts.laptops++;
    }
    if (isProductInCategory(product, "printers")) {
      categoryCounts.printers++;
    }
    if (isProductInCategory(product, "projectors")) {
      categoryCounts.projectors++;
    }
    if (isProductInCategory(product, "accessories")) {
      categoryCounts.accessories++;
    }
  });

  for (const category in categoryCounts) {
    const spanElement = document.querySelector(
      `.js-category-count[data-category-count="${category}"]`
    );
    if (spanElement) {
      spanElement.textContent = `(${categoryCounts[category]})`;
      console.log(
        `DEBUG: Updated ${category} count to (${categoryCounts[category]})`
      );
    } else {
      console.warn(
        `WARNING: Span element for category count "${category}" not found.`
      );
    }
  }
}

// --- Main Filter and Sort Logic ---
const applyFiltersAndSort = function () {
  console.log("DEBUG: applyFiltersAndSort called."); // DEBUG
  console.log("DEBUG: Current Search Term:", currentSearchTerm); // DEBUG
  console.log("DEBUG: Current Category Filter:", currentCategoryFilter); // DEBUG
  console.log(
    "DEBUG: Min Price Filter:",
    minPriceFilter,
    "Max Price Filter:",
    maxPriceFilter
  ); // DEBUG
  console.log("DEBUG: Current Sort Order:", currentSortOrder); // DEBUG

  let tempProducts = [...products]; // Start with all original products
  console.log(
    "DEBUG: Initial product count from 'products' array:",
    products.length
  ); // DEBUG
  console.log("DEBUG: tempProducts count after copy:", tempProducts.length); // DEBUG

  // 1. Apply Search Filter
  if (currentSearchTerm) {
    const searchTermLower = currentSearchTerm.toLowerCase();
    tempProducts = tempProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTermLower) ||
        (product.keywords &&
          product.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchTermLower)
          ))
    );
    console.log(
      "DEBUG: After search filter, product count:",
      tempProducts.length
    ); // DEBUG
  }

  // 2. Apply Category Filter
  if (currentCategoryFilter && currentCategoryFilter !== "all") {
    tempProducts = tempProducts.filter((product) =>
      isProductInCategory(product, currentCategoryFilter)
    );
    console.log(
      "DEBUG: After category filter, product count:",
      tempProducts.length
    ); // DEBUG
  }

  // 3. Apply Price Range Filter
  tempProducts = tempProducts.filter(
    (product) =>
      product.priceCents >= minPriceFilter &&
      product.priceCents <= maxPriceFilter
  );
  console.log("DEBUG: After price filter, product count:", tempProducts.length); // DEBUG

  // 4. Apply Sorting
  switch (currentSortOrder) {
    case "price-asc":
      tempProducts.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-desc":
      tempProducts.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "newest":
      // If you had a 'dateAdded' property, you'd sort by it here.
      // For now, it maintains the default order for 'newest' if no specific date property.
      break;
    case "popular":
    default:
      tempProducts.sort((a, b) => b.rating.count - a.rating.count);
      break;
  }

  displayedProducts = tempProducts;
  currentPage = 1;

  console.log(
    "DEBUG: Final displayedProducts count before rendering:",
    displayedProducts.length
  ); // DEBUG
  renderProductsForPage(currentPage);
  renderPagination();
};

// --- Event Listeners for Controls ---
const setupControlListeners = function () {
  console.log("DEBUG: setupControlListeners called."); // DEBUG

  const searchInput = document.querySelector(".js-search-input");
  const sortSelect = document.querySelector(".js-sort-select");
  const categoryRadios = document.querySelectorAll(".js-category-radio");
  const minPriceSlider = document.querySelector(".js-min-price-slider");
  const maxPriceSlider = document.querySelector(".js-max-price-slider");
  const minPriceLabel = document.querySelector(".js-min-price-label");
  const maxPriceLabel = document.querySelector(".js-max-price-label");

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value;
      console.log("DEBUG: Search input changed:", currentSearchTerm); // DEBUG
      applyFiltersAndSort();
    });
  }

  // Sort Select Listener
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSortOrder = e.target.value;
      console.log("DEBUG: Sort order changed to:", currentSortOrder); // DEBUG
      applyFiltersAndSort();
    });
  }

  // Category Radio Button Listeners
  if (categoryRadios.length > 0) {
    console.log(
      `DEBUG: Found ${categoryRadios.length} category radio buttons.`
    ); // DEBUG
    categoryRadios.forEach((radio) => {
      console.log(`DEBUG: Attaching change listener for radio: ${radio.id}`); // DEBUG
      radio.addEventListener("change", function () {
        currentCategoryFilter = this.dataset.category;
        console.log("DEBUG: Selected Category:", currentCategoryFilter); // DEBUG
        applyFiltersAndSort();
      });
    });

    const initiallyCheckedRadio = document.querySelector(
      ".js-category-radio:checked"
    );
    if (initiallyCheckedRadio) {
      currentCategoryFilter = initiallyCheckedRadio.dataset.category;
      console.log(
        "DEBUG: Initial category set from checked radio:",
        currentCategoryFilter
      ); // DEBUG
    }
  } else {
    console.warn(
      "WARNING: No category radio buttons found with class .js-category-radio"
    ); // DEBUG
  }

  // Price Range Sliders Listeners
  if (minPriceSlider && maxPriceSlider && minPriceLabel && maxPriceLabel) {
    console.log("DEBUG: Price sliders and labels found."); // DEBUG
    const updatePriceLabels = () => {
      minPriceLabel.textContent = `$${(minPriceFilter / 100).toFixed(0)}`;
      maxPriceLabel.textContent = `$${(maxPriceFilter / 100).toFixed(0)}`;
      console.log(
        `DEBUG: Price labels updated: Min $${minPriceFilter / 100} - Max $${
          maxPriceFilter / 100
        }`
      ); // DEBUG
    };

    minPriceSlider.addEventListener("input", (e) => {
      minPriceFilter = Number(e.target.value);
      if (minPriceFilter > maxPriceFilter) {
        maxPriceFilter = minPriceFilter;
        maxPriceSlider.value = minPriceFilter;
      }
      updatePriceLabels();
      applyFiltersAndSort();
    });

    maxPriceSlider.addEventListener("input", (e) => {
      maxPriceFilter = Number(e.target.value);
      if (maxPriceFilter < minPriceFilter) {
        minPriceFilter = maxPriceFilter;
        minPriceSlider.value = maxPriceFilter;
      }
      updatePriceLabels();
      applyFiltersAndSort();
    });

    minPriceFilter = Number(minPriceSlider.value);
    maxPriceFilter = Number(maxPriceSlider.value);
    updatePriceLabels(); // Initial update of labels
  } else {
    console.warn("WARNING: Price slider elements not found."); // DEBUG
  }
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("DEBUG: DOM Content Loaded event fired."); // DEBUG

  // CRITICAL CHECK: Ensure products array is loaded and not empty
  if (!products || products.length === 0) {
    console.error(
      "ERROR: The 'products' array is either not loaded or is empty. Please check 'products.js' path and content. Script execution halted."
    );
    // Display a message directly on the page to the user
    const productGrid = document.querySelector(".js--product--grid");
    if (productGrid) {
      productGrid.innerHTML =
        '<p style="text-align: center; margin-top: 50px; font-size: 1.2rem; color: #cc0000;">Error: Products could not be loaded. Please check your browser console for details.</p>';
    }
    return; // Stop further script execution if products are unavailable
  }
  console.log(
    `DEBUG: Products array loaded successfully with ${products.length} items.`
  );
  displayedProducts = [...products]; // Initialize displayedProducts here after successful load

  // Calculate min/max product prices dynamically from the 'products' array
  minProductPriceCents = Math.min(...products.map((p) => p.priceCents));
  maxProductPriceCents = Math.max(...products.map((p) => p.priceCents));
  console.log(
    `DEBUG: Dynamic product prices calculated: Min=${minProductPriceCents}, Max=${maxProductPriceCents}`
  );

  // Set initial filter values based on calculated product prices
  minPriceFilter = minProductPriceCents;
  maxPriceFilter = maxProductPriceCents;

  // Get slider elements and set their min/max/initial values
  const minPriceSlider = document.querySelector(".js-min-price-slider");
  const maxPriceSlider = document.querySelector(".js-max-price-slider");

  if (minPriceSlider && maxPriceSlider) {
    minPriceSlider.min = minProductPriceCents;
    minPriceSlider.max = maxProductPriceCents;
    minPriceSlider.value = minProductPriceCents; // Set initial value to actual min

    maxPriceSlider.min = minProductPriceCents;
    maxPriceSlider.max = maxProductPriceCents;
    maxPriceSlider.value = maxProductPriceCents; // Set initial value to actual max
    console.log(
      "DEBUG: Price sliders min/max/value attributes set dynamically."
    );
  } else {
    console.warn(
      "WARNING: Price slider elements not found during initialization. Check .js-min-price-slider and .js-max-price-slider classes in HTML."
    );
  }

  setupControlListeners(); // This will now correctly initialize price filters based on dynamic slider values
  updateCategoryCounts(); // Call this here to set category counts on load
  applyFiltersAndSort();
  updateCartQuantity();
  console.log("DEBUG: Shop page initialized successfully."); // DEBUG
});
