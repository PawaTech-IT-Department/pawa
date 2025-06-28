// js/data/cart.js
export let cart; // Export cart as a variable

loadCartFromLocalStorage(); // Load cart when the module loads

function loadCartFromLocalStorage() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("Cart module loaded. Initial cart:", cart);
}

export function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Cart module: Cart saved to localStorage:", cart);
}

export function addToCart(productId, quantityToAdd = 1) {
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
  saveCartToLocalStorage(); // Always save after modification
  console.log("Cart module: Cart after adding:", cart);
}

export function calculateTotalCartQuantity() {
  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });
  return totalQuantity;
}

// These are typically used by the cart page, but exported for completeness
export function updateCartItemQuantity(productId, change) {
  let itemFound = false;
  cart.forEach((cartItem) => {
    if (cartItem.productId === productId) {
      cartItem.quantity += change;
      if (cartItem.quantity <= 0) {
        removeCartItem(productId);
      }
      itemFound = true;
    }
  });
  if (itemFound) {
    saveCartToLocalStorage();
  }
}

export function removeCartItem(productId) {
  cart = cart.filter((cartItem) => cartItem.productId !== productId);
  saveCartToLocalStorage();
}
