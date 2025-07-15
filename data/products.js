import formatCurrency from "../scripts/utils/moneyFormatter.js";

// The URL of your backend endpoint
const API_URL = "http://localhost:5000/api/products";

// The Product class remains the same - it's still very useful!
class Product {
  id;
  image;
  name;
  rating;
  priceCents;
  keywords;

  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.rating = productDetails.rating;
    this.priceCents = productDetails.priceCents;
    this.keywords = productDetails.keywords;
  }

  getStars() {
    // Your getStars logic remains the same
    const fullStars = Math.floor(this.rating.stars);
    const halfStar = this.rating.stars % 1 >= 0.5 ? 1 : 0;
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
    return starsHTML;
  }

  getPrice(quantity = 1) {
    return `$${formatCurrency(this.priceCents * quantity)}`;
  }
}

/**
 * Fetches all products from the backend API.
 * @returns {Promise<Product[]>} A promise that resolves to an array of Product instances.
 */
export async function loadProducts() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const productsData = await response.json();

    // Transform the raw JSON data into instances of our Product class
    const products = productsData.products.map((productDetails) => {
      return new Product(productDetails);
    });

    return products;
  } catch (error) {
    console.error("Failed to load products:", error);
    // Return an empty array or handle the error as needed
    return [];
  }
}
