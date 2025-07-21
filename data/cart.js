class Cart {
  #localStorageKey; //Private Property
  cartItems;

  constructor(localStorageKey) {
    //Setting their local storage keys
    this.#localStorageKey = localStorageKey;
    //Loading the from Storage
    this.#loadCartFromLocalStorage();
  }

  //Loading from local storage function
  #loadCartFromLocalStorage() {
    this.cartItems =
      JSON.parse(localStorage.getItem(this.#localStorageKey)) || [];
    this.updateCartQuantity();
  }
  
  saveCartToLocalStorage() {
    localStorage.setItem(this.#localStorageKey, JSON.stringify(this.cartItems));
    this.updateCartQuantity();
  }
  
  calculateTotalCartQuantity() {
    let totalQuantity = 0;
    this.cartItems.forEach((cartItem) => {
      totalQuantity += cartItem.quantity;
    });
    return totalQuantity;
  }
  
  showQuantity() {
  const cartQuantityElement = document.querySelector(".js-cart-quantity");
    const quantityOfCart = this.calculateTotalCartQuantity();
  if (!cartQuantityElement) return;
  if (quantityOfCart === 0) {
    cartQuantityElement.style.opacity = 0;
  } else {
    cartQuantityElement.style.opacity = 1;
  }
}

  addToCart(productId, quantityToAdd = 1) {
    let matchingItem = this.cartItems.find((cartItem) => cartItem.productId === productId);
    if (matchingItem) {
      matchingItem.quantity += quantityToAdd;
    } else {
      this.cartItems.push({
        productId: productId,
        quantity: quantityToAdd,
        deliveryOptionsId: "1",
      });
    }
    this.saveCartToLocalStorage();
  }

  removeFromCart(productId) {
    this.cartItems = this.cartItems.filter((item) => item.productId !== productId);
    this.saveCartToLocalStorage();
  }

  updateItemQuantity(productId, newQuantity) {
    let matchingItem = this.cartItems.find((cartItem) => cartItem.productId === productId);
    if (matchingItem) {
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
      } else {
        matchingItem.quantity = newQuantity;
        this.saveCartToLocalStorage();
      }
    }
  }

  updateCartQuantity() {
  const cartQuantityElement = document.querySelector(".js-cart-quantity");

  let totalQuantity = 0;
    this.cartItems.forEach((cartItem) => {
    totalQuantity += cartItem?.quantity;
  });
  if (cartQuantityElement) {
    cartQuantityElement.textContent = totalQuantity;
  }
    this.showQuantity();
}

  emptyCart() {
    this.cartItems = [];
    this.saveCartToLocalStorage();
  }
  
  // Getter for cart items to maintain compatibility
  get cart() {
    return this.cartItems;
  }
}

// Initialize the main cart instance
const cartInstance = new Cart("cart");
export { cartInstance };

// Export the cart instance and methods for compatibility
export const addToCart = (productId, quantity) => cartInstance.addToCart(productId, quantity);
export const removeFromCart = (productId) => cartInstance.removeFromCart(productId);
export const updateItemQuantity = (productId, newQuantity) => cartInstance.updateItemQuantity(productId, newQuantity);
export const updateCartQuantity = () => cartInstance.updateCartQuantity();
export const saveCartToLocalStorage = () => cartInstance.saveCartToLocalStorage();
export const calculateTotalCartQuantity = () => cartInstance.calculateTotalCartQuantity();
export const showQuantity = () => cartInstance.showQuantity();
export const emptyCart = () => cartInstance.emptyCart();
