import {
  cart,
  removeFromCart,
  updateCartQuantity,
  addToCart,
  saveCartToLocalStorage,
} from "../../data/cart.js"; // Ensure this path is correct
import { getProduct } from "../../data/products.js"; // Ensure this path is correct
import { deliveryOptions } from "../../data/deliveryOptions.js";
import { renderPaymentSummary } from "./paymentSummary.js";
import formatCurrency from "../utils/moneyFormatter.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

export function renderOrderSummary() {
  function deliveryOptionsHTML() {
    let html = "";
    deliveryOptions.forEach((deliveryOption) => {
      let deliveryDate = dayjs().add(deliveryOption.deliveryDays, "day");
      // Skip weekends
      while (deliveryDate.day() === 0 || deliveryDate.day() === 6) {
        deliveryDate = deliveryDate.add(1, "day");
      }
      const dateString = deliveryDate.format("dddd, MMMM D");
      html += `
      <div class="delivery-date">Delivery date: ${dateString}</div>
      `;
    });
    return html;
  }

  const cartList = document.querySelector(".cart--product--list");
  const addHTML = function () {
    let cartSummaryHTML = "";
    cart.forEach((cartItem) => {
      const productId = cartItem.productId;
      const matchingProduct = getProduct(productId);

      cartSummaryHTML += `
    <div class="cart--product--card 
    js-cart-item-container-${matchingProduct.id}">
      <div class="cart--product--image">
        <img
          src="/img/${matchingProduct.image.slice(7)}"
          alt="${matchingProduct.name}"
        />
      </div>
      <div class="cart--product--details">
        ${deliveryOptionsHTML()}
        <h3 class="cart--product--name">${matchingProduct.name}</h3>
        <p class="cart--product--description">
          Product description. To be added in the products information
        </p>
        <div class="cart--quantity--controls" data-product-id="${
          matchingProduct.id
        }">
          <button class="cart--quantity--button">-</button>
          <span class="cart--quantity">${cartItem.quantity}</span>
          <button class="cart--quantity--button">+</button>
        </div>
        <a href="#" class="cart--remove--item js--delete-link" data-product-id="${
          matchingProduct.id
        }"
          ><i class="fas fa-trash-alt"></i> Remove</a
        >
      </div>
      <div class="cart--product--price">
        ${matchingProduct.getPrice(cartItem.quantity)}
      </div>
    </div>
  `;
    });

    cartList.innerHTML = cartSummaryHTML;

    // Attach event listeners after rendering
    const allDeleteLinks = document.querySelectorAll(".js--delete-link");
    allDeleteLinks.forEach((delLink) => {
      delLink.addEventListener("click", function (e) {
        e.preventDefault();
        const productId = delLink.dataset.productId;
        removeFromCart(productId);
        const itemToBeRemoved = document.querySelector(
          `.js-cart-item-container-${productId}`
        );
        if (itemToBeRemoved) {
          itemToBeRemoved.remove();
        }
        updateCartQuantity();
        renderPaymentSummary();
      });
    });

    const allUpdateButtons = document.querySelectorAll(
      ".cart--quantity--controls"
    );
    allUpdateButtons.forEach((controls) => {
      const minusBtn = controls.querySelectorAll(".cart--quantity--button")[0];
      const plusBtn = controls.querySelectorAll(".cart--quantity--button")[1];
      const productId = controls.dataset.productId;
      const quantitySpan = controls.querySelector(".cart--quantity");

      plusBtn.addEventListener("click", function (e) {
        e.preventDefault();
        addToCart(productId, 1);
        // Find the updated cart item and update the quantity display
        const updatedCartItem = cart.find(
          (item) => item.productId === productId
        );
        if (updatedCartItem) {
          quantitySpan.textContent = updatedCartItem.quantity;
        }
        updateCartQuantity();
        renderOrderSummary();
        renderPaymentSummary();
      });
      minusBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const itemToBeRemoved = cart.find(
          (item) => item.productId === productId
        );
        if (itemToBeRemoved && itemToBeRemoved.quantity === 1) {
          removeFromCart(productId);
          const removedItem = document.querySelector(
            `.js-cart-item-container-${productId}`
          );
          if (removedItem) {
            removedItem.remove();
          }
          updateCartQuantity();
          renderOrderSummary();
          renderPaymentSummary();
        } else if (itemToBeRemoved) {
          cart.map((cartItem) => {
            if (cartItem.productId === itemToBeRemoved.productId) {
              cartItem.quantity--;
            }
          });

          const updateCartItem = cart.find(
            (item) => item.productId === productId
          );
          if (updateCartItem) {
            quantitySpan.textContent = updateCartItem.quantity;
          }
          updateCartQuantity();
          renderOrderSummary();
          renderPaymentSummary();
          saveCartToLocalStorage();
        }
      });
    });
  };

  updateCartQuantity();
  addHTML();
}
