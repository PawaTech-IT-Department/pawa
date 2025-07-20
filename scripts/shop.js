import { getProducts, getProduct, Product } from "../data/products.js";
import { cart, addToCart, updateCartQuantity } from "../data/cart.js";

// GLOBAL VARIABLES
let minProductPriceCents;
let maxProductPriceCents;

function renderProductGrid() {
  // GLOBAL VARIABLES
  // Global variables for min/max product prices, to be calculated
  let minProductPriceCents;
  let maxProductPriceCents;

  // --- Global State Variables ---
  const productsPerPage = 9;
  let currentPage = 1;
  let currentSearchTerm = "";
  let currentSortOrder = "popular";

// This array will hold the products after applying all filters and sorting
let displayedProducts = []; // Initialize as empty, populated after products check
let allProducts = []; // Array to hold all products after loading

  // This array will hold the products after applying all filters and sorting
  let displayedProducts = []; // Initialize as empty, populated after products check

  // GLOBAL ELEMENTS
  const productGrid = document.querySelector(".js--product--grid");
  // Slider elements and set their min/max/initial values
  const minPriceSlider = document.querySelector(".js-min-price-slider");
  const maxPriceSlider = document.querySelector(".js-max-price-slider");
  const searchInput = document.querySelector(".js-search-input");
  const sortSelect = document.querySelector(".js-sort-select");
  const categoryRadios = document.querySelectorAll(".js-category-radio");
  const minPriceLabel = document.querySelector(".js-min-price-label");
  const maxPriceLabel = document.querySelector(".js-max-price-label");

  // --- Helper Functions (Cart Management) ---

  // --- Pagination Rendering ---
  const renderPagination = function () {
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
    document.querySelectorAll(".js-pagination-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const newPage = Number(e.target.dataset.page);
        if (
          newPage !== currentPage &&
          !e.target.classList.contains("disabled")
        ) {
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
    const allAddToCartButtons = document.querySelectorAll(".js-add-to-cart");

    allAddToCartButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();

        const productId = button.dataset.productId;
        const quantitySelector = document.querySelector(
          `.js-quantity-selector[data-product-id="${productId}"]`
        );
        if (!quantitySelector) {
          console.warn(
            `Quantity selector not found for productId: ${productId}`
          );
          return;
        }
        const quantity = Number(quantitySelector.value);

        addToCart(productId, quantity);
        updateCartQuantity();
      });
    });
  }

  // --- Product Rendering ---
  const renderProductsForPage = function (page) {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToDisplay = displayedProducts.slice(startIndex, endIndex);

    let productHTML = "";

    if (productsToDisplay.length === 0) {
      productHTML =
        '<p style="text-align: center; margin-top: 50px; font-size: 1.2rem; color: var(--text-muted);">No products found matching your criteria.</p>';
    } else {
      productsToDisplay.forEach((product) => {
        productHTML += `
          <div class="product--card">
            <img
              src="/img/${product.image.slice(7)}"
              alt="${product.name}"
            />
            <h4 class="product--name">${product.name}</h4>
            <div class="product--rating">
              ${product.getStars()} <span>(${product.rating.count})</span>
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
            <div class="product--price">
              ${product.getPrice()}
            </div>
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

  allProducts.forEach((product) => {
    categoryCounts.all++; // Every product counts for 'all'

    // Sort Select Listener
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentSortOrder = e.target.value;
        applyFiltersAndSort();
      });
    }

    // Category Radio Button Listeners
    if (categoryRadios.length > 0) {
      categoryRadios.forEach((radio) => {
        radio.addEventListener("change", function () {
          currentCategoryFilter = this.dataset.category;
          applyFiltersAndSort();
        });
      });
      const initiallyCheckedRadio = document.querySelector(
        ".js-category-radio:checked"
      );
      if (initiallyCheckedRadio) {
        currentCategoryFilter = initiallyCheckedRadio.dataset.category;
      }
    }

    // Price Range Sliders Listeners
    if (minPriceSlider && maxPriceSlider && minPriceLabel && maxPriceLabel) {
      const updatePriceLabels = () => {
        minPriceLabel.textContent = `$${(minPriceFilter / 100).toFixed(0)}`;
        maxPriceLabel.textContent = `$${(maxPriceFilter / 100).toFixed(0)}`;
      };

      minPriceSlider.addEventListener("input", function (e) {
        minPriceFilter = Number(e.target.value);
        if (minPriceFilter > maxPriceFilter) {
          maxPriceFilter = minPriceFilter;
          maxPriceSlider.value = minPriceFilter;
        }
        updatePriceLabels();
        applyFiltersAndSort();
      });

      maxPriceSlider.addEventListener("input", function (e) {
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
    }
  };

  // --- Function to Update Category Counts ---
  function updateCategoryCounts() {
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
      }
    }
  }

  // --- Helper for Category Matching (Reusable) ---
  const isProductInCategory = function (product, category) {
    if (!product.keywords) return false;

    const categoryLower = category.toLowerCase();

    // Special handling for 'all'
    if (categoryLower === "all") {
      return true;
    }
    return false;
  });
};
// --- Main Filter and Sort Logic ---
const applyFiltersAndSort = function () {
  let tempProducts = [...allProducts]; // Use loaded products

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
    }

    // 2. Apply Category Filter
    if (currentCategoryFilter && currentCategoryFilter !== "all") {
      tempProducts = tempProducts.filter((product) =>
        isProductInCategory(product, currentCategoryFilter)
      );
    }

    // 3. Apply Price Range Filter
    tempProducts = tempProducts.filter(
      (product) =>
        product.priceCents >= minPriceFilter &&
        product.priceCents <= maxPriceFilter
    );

  // 2. Apply Category Filter
  if (currentCategoryFilter && currentCategoryFilter !== "all") {
    tempProducts = tempProducts.filter((product) =>
      isProductInCategory(product, currentCategoryFilter)
    );
  }

  // 3. Apply Price Range Filter
  tempProducts = tempProducts.filter(
    (product) =>
      product.priceCents >= minPriceFilter &&
      product.priceCents <= maxPriceFilter
  );

  // 4. Apply Sorting
  switch (currentSortOrder) {
    case "price-asc":
      tempProducts.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-desc":
      tempProducts.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "newest":
      tempProducts.reverse();
      break;
    case "popular":
    default:
      tempProducts.sort((a, b) => b.rating.count - a.rating.count);
      break;
  }

  displayedProducts = tempProducts;
  currentPage = 1;
  renderProductsForPage(currentPage);
  renderPagination();
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async function () {
  try {
    allProducts = await getProducts();
    if (!allProducts || allProducts.length === 0) {
      throw new Error("No products loaded from backend.");
    }
    displayedProducts = [...allProducts];
    minProductPriceCents = Math.min(...allProducts.map((p) => p.priceCents));
    maxProductPriceCents = Math.max(...allProducts.map((p) => p.priceCents));
    minPriceFilter = minProductPriceCents;
    maxPriceFilter = maxProductPriceCents;
    if (minPriceSlider && maxPriceSlider) {
      minPriceSlider.min = minProductPriceCents;
      minPriceSlider.max = maxProductPriceCents;
      minPriceSlider.value = minProductPriceCents;
      maxPriceSlider.min = minProductPriceCents;
      maxPriceSlider.max = maxProductPriceCents;
      maxPriceSlider.value = maxProductPriceCents;
    }
    updateCartQuantity();
    setupControlListeners();
    applyFiltersAndSort();
    updateCategoryCounts();
  } catch (err) {
    console.error("ERROR: ", err.message);
    if (productGrid) {
      productGrid.innerHTML = `<p style="text-align: center; margin-top: 50px; font-size: 1.2rem; color: #cc0000;">Error: Products could not be loaded. Please check your backend server and browser console for details.</p>`;
    }
  }
});
