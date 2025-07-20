import { cartInstance, saveCartToLocalStorage } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { deliveryOptions } from "../../data/deliveryOptions.js";
import { renderPaymentSummary } from "./paymentSummary.js";
import formatCurrency from "../utils/moneyFormatter.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

export async function renderOrderSummary() {
  function deliveryOptionsHTML() {
    let html = "";
    deliveryOptions.forEach((deliveryOption) => {
      let deliveryDate = dayjs().add(deliveryOption.deliveryDays, "day");
      while (deliveryDate.day() === 0 || deliveryDate.day() === 6) {
        deliveryDate = deliveryDate.add(1, "day");
      }
      const dateString = deliveryDate.format("dddd, MMMM D");
      html += `<div class="delivery-date">Delivery date: ${dateString}</div>`;
    });
    return html;
  }

  const cartList = document.querySelector(".cart--product--list");

  const addHTML = async function () {
    let cartSummaryHTML = "";
    for (const cartItem of cartInstance.cart) {
      try {
        const productId = cartItem.productId;
        const matchingProduct = await getProduct(productId);
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
          <div class="cart--quantity--controls" data-product-id="${matchingProduct.id}">
            <button class="cart--quantity--button">-</button>
            <span class="cart--quantity">${cartItem.quantity}</span>
            <button class="cart--quantity--button">+</button>
          </div>
          <a href="#" class="cart--remove--item js--delete-link" data-product-id="${matchingProduct.id}"><i class="fas fa-trash-alt"></i> Remove</a>
        </div>
        <div class="cart--product--price js-product-price" data-product-id="${matchingProduct.id}">
          ${matchingProduct.getPrice(cartItem.quantity)}
        </div>
      </div>
    `;
      } catch (error) {
        cartSummaryHTML += `
          <div class="cart--product--card js-cart-item-container-${cartItem.productId}">
            <div class="cart--product--details">
              <h3 class="cart--product--name">Product Not Found</h3>
              <p class="cart--product--description">This product is no longer available.</p>
              <a href="#" class="cart--remove--item js--delete-link" data-product-id="${cartItem.productId}">
                <i class="fas fa-trash-alt"></i> Remove
              </a>
            </div>
          </div>
        `;
      }
    }
    cartList.innerHTML = cartSummaryHTML;

    // Attach event listeners after rendering
    const allDeleteLinks = document.querySelectorAll(".js--delete-link");
    allDeleteLinks.forEach((delLink) => {
      delLink.addEventListener("click", async function (e) {
        e.preventDefault();
        const productId = delLink.dataset.productId;
        cartInstance.removeFromCart(productId);
        cartInstance.updateCartQuantity();
        await renderOrderSummary();
        await renderPaymentSummary();
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

      plusBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        cartInstance.addToCart(productId, 1);
        cartInstance.updateCartQuantity();
        await renderOrderSummary();
        await renderPaymentSummary();
      });
      
      minusBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        const itemToBeRemoved = cartInstance.cart.find(
          (item) => item.productId === productId
        );
        if (itemToBeRemoved && itemToBeRemoved.quantity === 1) {
          cartInstance.removeFromCart(productId);
          cartInstance.updateCartQuantity();
          await renderOrderSummary();
          await renderPaymentSummary();
        } else if (itemToBeRemoved) {
          cartInstance.cart.map((cartItem) => {
            if (cartItem.productId === itemToBeRemoved.productId) {
              cartItem.quantity--;
            }
          });
          cartInstance.updateCartQuantity();
          await renderOrderSummary();
          await renderPaymentSummary();
          saveCartToLocalStorage();
        }
      });
    });
  };

  cartInstance.updateCartQuantity();
  await addHTML();
}
