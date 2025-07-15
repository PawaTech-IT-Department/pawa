import formatCurrency from "../scripts/utils/moneyFormatter.js";

const API_URL = "http://localhost:5000/api/products";

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

export async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const productsData = await response.json();
    console.log("Raw API response:", productsData);

    // Handle both array and object responses
    const rawProducts = Array.isArray(productsData)
      ? productsData
      : productsData.products || [];

    if (!rawProducts || rawProducts.length === 0) {
      console.warn("No products found in API response");
      return [];
    }

    // Transform and validate product data
    const products = rawProducts.map((productDetails) => {
      const validatedDetails = {
        id: productDetails.id || crypto.randomUUID(),
        image: productDetails.image || "default.jpg",
        name: productDetails.name || "Unnamed Product",
        rating: {
          stars: productDetails.rating_stars || 0,
          count: productDetails.rating_count || 0,
        },
        priceCents: Number(productDetails.pricecents) || 0,
        keywords: Array.isArray(productDetails.keywords)
          ? productDetails.keywords
          : [],
      };
      return new Product(validatedDetails);
    });

    console.log("Transformed products:", products);
    return products;
  } catch (error) {
    console.error("Failed to load products:", error);
    return [];
  }
}
