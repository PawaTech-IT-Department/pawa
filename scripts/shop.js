// Ensure products array is defined before using it
if (typeof products === "undefined" || !Array.isArray(products)) {
  throw new Error("The 'products' array is not defined.");
}

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

  // Ensure product.image contains only the filename, not a path
  const imageFileName = product.image.split("/").pop();

  productHTML += `
  <div class="product--card">
    <img
      src="/img/products/${imageFileName}"
      alt="${product.name}"
    />
    <h4 class="product--name">${product.name}</h4>
    <p class="product--description">
      ${product.description}
    </p>
    <div class="product--rating">
      ${starsHTML} <span>(${product.rating.count})</span>
    </div>
    <div class="product--price">$${(product.priceCents / 100).toFixed(2)}</div>
    <button class="btn btn--primary add-to-cart">Add to Cart</button>
  </div>
  `;
});

console.log(productHTML);

const productGrid = document.querySelector(".js--product--grid");
if (productGrid) {
  productGrid.innerHTML = productHTML;
} else {
  console.error("Element with class 'js--product--grid' not found.");
}

// Example product object structure:
// {
//     id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
//     image: "images/products/laptop-ultrabook-x1.jpg",
//     name: "Ultrabook X1 Pro Laptop",
//     rating: {
//       stars: 4.5,
//       count: 87,
//     },
//     priceCents: 109000,
//     keywords: ["laptop", "ultrabook", "computers"],
//     description:
//       "Experience lightning-fast performance with the Ultrabook X1 Pro, perfect for multitasking and heavy-duty applications.",
//   }
