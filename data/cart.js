// Initialize cart array from local storage
export let cart = JSON.parse(localStorage.getItem("cart")) || [];

loadCartFromLocalStorage(); // Load cart when the module loads

<<<<<<< HEAD
export function showQuantity() {
  const cartQuantityElement = document.querySelector(".js-cart-quantity");
  const quantityOfCart = calculateTotalCartQuantity();
  if (!cartQuantityElement) return;
  if (quantityOfCart === 0) {
    cartQuantityElement.style.opacity = 0;
  } else {
    cartQuantityElement.style.opacity = 1;
  }
}

function loadCartFromLocalStorage() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
=======
function loadCartFromLocalStorage() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("Cart module loaded. Initial cart:", cart);
>>>>>>> w3an2-master
}

export function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
<<<<<<< HEAD
=======
  console.log("Cart module: Cart saved to localStorage:", cart);
>>>>>>> w3an2-master
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
<<<<<<< HEAD
      deliveryOptionsId: "1",
    });
  }
  saveCartToLocalStorage(); // Always save after modification
=======
    });
  }
  saveCartToLocalStorage(); // Always save after modification
  console.log("Cart module: Cart after adding:", cart);
>>>>>>> w3an2-master
}

export function calculateTotalCartQuantity() {
  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });
  return totalQuantity;
}

export function removeFromCart(productId) {
<<<<<<< HEAD
=======
  console.log(`Product ID to be removed ${productId}`);
  console.log(cart);
>>>>>>> w3an2-master
  const newCart = [];
  cart.forEach((item) => {
    if (item.productId !== productId) {
      newCart.push(item);
    }
  });
  cart = newCart;
  saveCartToLocalStorage(); // Always save after modification
}
<<<<<<< HEAD
export function updateCartQuantity() {
  const cartQuantityElement = document.querySelector(".js-cart-quantity");

  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem?.quantity;
  });
  if (cartQuantityElement) {
    cartQuantityElement.textContent = totalQuantity;
  }
  showQuantity();
}

function emptyCart() {
  cart = [];
  saveCartToLocalStorage();
}
=======
>>>>>>> w3an2-master
