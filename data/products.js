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
    // Ensure priceCents is a number and handle potential string values
    this.priceCents = typeof productDetails.priceCents === 'number' 
      ? productDetails.priceCents 
      : parseInt(productDetails.priceCents) || 0;
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
    // Ensure quantity is a number and priceCents is valid
    const qty = typeof quantity === 'number' ? quantity : parseInt(quantity) || 1;
    const price = this.priceCents || 0;
    const totalCents = price * qty;
    
    try {
      return `$${formatCurrency(totalCents)}`;
    } catch (error) {
      console.error('Error formatting price:', error);
      return '$0.00';
    }
  }
}

// Fetch all products from backend and map to Product instances
export async function getProducts({ page = 1, limit = 100, sort = '', keywords = '' } = {}) {
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (sort) url += `&sort=${encodeURIComponent(sort)}`;
  if (keywords) url += `&keywords=${encodeURIComponent(keywords)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  const { products } = await res.json();
  // Convert rating fields and pricecents to camelCase
  return products.map((p) => new Product({
    ...p,
    priceCents: p.pricecents, // <-- fix here
    rating: { stars: p.rating_stars, count: p.rating_count },
  }));
}

// Fetch a single product by ID
export async function getProduct(productId) {
  const res = await fetch(`${API_URL}/${productId}`);
  if (!res.ok) throw new Error('Product not found');
  const p = await res.json();
  return new Product({
    ...p,
    priceCents: p.pricecents, // <-- fix here
    rating: { stars: p.rating_stars, count: p.rating_count },
  });
}

// Optionally, export Product class if needed elsewhere
export { Product };
