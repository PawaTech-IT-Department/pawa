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
    let matchingItem;
    this.cartItems.forEach((cartItem) => {
      if (productId === cartItem.productId) {
        matchingItem = cartItem;
      }
    });

    if (matchingItem) {
      matchingItem.quantity += quantityToAdd;
    } else {
      this.cartItems.push({
        productId: productId,
        quantity: quantityToAdd,
        deliveryOptionsId: "1",
      });
    }
    this.saveCartToLocalStorage(); // Always save after modification
  }
  removeFromCart(productId) {
    const newCart = [];
    this.cartItems.forEach((item) => {
      if (item.productId !== productId) {
        newCart.push(item);
      }
    });
    this.cartItems = newCart;
    this.saveCartToLocalStorage(); // Always save after modification
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
}

//Initializing new carts
const cart = new Cart("cart-oop");
const businessCart = new Cart("cart-business");
