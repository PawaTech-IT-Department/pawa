// Initialize cart array from local storage
export let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

export function removeFromCart(productId) {
  console.log(`Product ID to be removed ${productId}`);
  console.log(cart);
  const newCart = [];
  cart.forEach((item) => {
    if (item.productId !== productId) {
      newCart.push(item);
    }
  });
  cart = newCart;
  saveCartToLocalStorage(); // Always save after modification
}
