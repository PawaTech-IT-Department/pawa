import { cartInstance } from "../../data/cart.js";
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
    // Fetch all products concurrently for speed
    const productPromises = cartInstance.cart.map(async (cartItem) => {
      try {
        const productId = cartItem.productId;
        const matchingProduct = await getProduct(productId);
        return {
          cartItem,
          matchingProduct
        };
      } catch (error) {
        return {
          cartItem,
          matchingProduct: null
        };
      }
    });
    const productResults = await Promise.all(productPromises);
    for (const { cartItem, matchingProduct } of productResults) {
      if (matchingProduct) {
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
            <button class="cart--quantity--button js-minus-button">-</button>
            <span class="cart--quantity">${cartItem.quantity}</span>
            <button class="cart--quantity--button js-plus-button">+</button>
          </div>
          <a href="#" class="cart--remove--item js--delete-link" data-product-id="${matchingProduct.id}"><i class="fas fa-trash-alt"></i> Remove</a>
        </div>
        <div class="cart--product--price js-product-price" data-product-id="${matchingProduct.id}">
          ${formatCurrency(matchingProduct.priceCents * cartItem.quantity)}
        </div>
      </div>
    `;
      } else {
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
        await renderOrderSummary();
        await renderPaymentSummary();
      });
    });

    const allUpdateButtons = document.querySelectorAll(
      ".cart--quantity--controls"
    );
    allUpdateButtons.forEach((controls) => {
      const minusBtn = controls.querySelector(".js-minus-button");
      const plusBtn = controls.querySelector(".js-plus-button");
      const productId = controls.dataset.productId;

      plusBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        cartInstance.updateItemQuantity(productId, (cartInstance.cart.find(item => item.productId === productId)?.quantity || 0) + 1);
        await renderOrderSummary();
        await renderPaymentSummary();
      });
      
      minusBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        cartInstance.updateItemQuantity(productId, (cartInstance.cart.find(item => item.productId === productId)?.quantity || 1) - 1);
        await renderOrderSummary();
        await renderPaymentSummary();
      });
    });
  };

  await addHTML();
}
