import { products } from "../data/products.js"; // Assuming products.js exports your product data

// Function to render products into the grid
const displayProductsInGrid = function () {
  let productHTML = "";

  products.forEach((product) => {
    // Generate star icons based on rating
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
          <select class="js-quantity-selector" data-product-id="${product.id}">
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

  const productGrid = document.querySelector(".js--product--grid");
  if (productGrid) {
    // Add a check in case grid isn't always present
    productGrid.innerHTML = productHTML;
  }

  // IMPORTANT: Attach event listeners AFTER the HTML is in the DOM
  attachAddToCartListeners();
};

// Initialize cart array
// Try to load cart from localStorage, otherwise, initialize as empty array
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function attachAddToCartListeners() {
  const allAddToCartButtons = document.querySelectorAll(".js-add-to-cart");

  allAddToCartButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const productId = button.dataset.productId;
      const quantitySelector = document.querySelector(
        `.js-quantity-selector[data-product-id="${productId}"]`
      );
      const quantity = Number(quantitySelector.value);

      addToCart(productId, quantity);
      updateCartQuantity();
      saveCartToLocalStorage(); // Save cart after every modification
    });
  });
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
  console.log("Cart after adding:", cart);
}

function updateCartQuantity() {
  // CORRECTED: The error was here! Removed the leading dot from the class name.
  // Also, consider calling this *after* the DOM is fully loaded.
  const cartQuantityElement = document.querySelector(".js-cart-quantity");
  if (!cartQuantityElement) {
    // This warning will still show if MainHeader hasn't rendered yet
    // but the DOMContentLoaded listener below will address the timing.
    console.warn(
      "Element with class .js-cart-quantity not found. Make sure it exists in your HTML."
    );
    return;
  }

  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });
  cartQuantityElement.textContent = totalQuantity;
  console.log("Total cart quantity:", totalQuantity);
}

// --- THE CRUCIAL FIX ---
// Defer execution of initial display and cart update until the DOM is fully loaded,
// including custom elements.
document.addEventListener("DOMContentLoaded", () => {
  displayProductsInGrid();
  updateCartQuantity(); // Now it will find the element after the header component renders
});
