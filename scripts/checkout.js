import { cart, removeFromCart } from "../data/cart.js"; // Ensure this path is correct
import { products } from "../data/products.js"; // Ensure this path is correct

const cartList = document.querySelector(".cart--product--list");

let cartSummaryHTML = "";
cart.forEach((cartItem) => {
  const productId = cartItem.productId;
  let matchingProduct;
  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });
  console.log();

  cartSummaryHTML += `
    <div class="cart--product--card">
      <div class="cart--product--image">
        <img
          src="/img/${matchingProduct.image.slice(7)}"
          alt="${matchingProduct.name}"
        />
      </div>
      <div class="cart--product--details">
        <div class="delivery-date">Delivery date: Wednesday, June 15</div>
        <h3 class="cart--product--name">${matchingProduct.name}</h3>
        <p class="cart--product--description">
          Intel i7, 16GB RAM, RTX 3060, 512GB SSD
        </p>
        <div class="cart--quantity--controls">
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
      <div class="cart--product--price">$${(
        matchingProduct.priceCents / 100
      ).toFixed(2)}</div>
    </div>
  `;
});

cartList.innerHTML = cartSummaryHTML;

const allDeleteLinks = document.querySelectorAll(".js--delete-link");
allDeleteLinks.forEach((delLink) => {
  delLink.addEventListener("click", function (e) {
    e.preventDefault();
    const productId = delLink.dataset.productId;
    console.log(productId);
    removeFromCart(productId);
    console.log(cart);
  });
});
