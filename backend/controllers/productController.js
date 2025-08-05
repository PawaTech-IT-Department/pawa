import Product from '../models/Product.js';

function parseSort(sort) {
  if (sort === 'price_asc') return { pricecents: 1 };
  if (sort === 'price_desc') return { pricecents: -1 };
  return {};
}

const productController = {
  getProducts: async (req, res) => {
    try {
      const { page = 1, limit = 10, sort, keywords } = req.query;
      const skip = (page - 1) * limit;
      let filter = {};
      if (keywords) {
        const kwArr = keywords.split(',');
        filter.keywords = { $in: kwArr };
      }
      const sortObj = parseSort(sort);
      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sortObj)
          .skip(Number(skip))
          .limit(Number(limit)),
        Product.countDocuments(filter),
      ]);
      res.json({ products, total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const { image, name, description, rating, pricecents, keywords, category, stock, brand } = req.body;
      const product = new Product({
        image,
        name,
        description,
        rating: rating?.stars || 0,
        pricecents,
        keywords,
        category,
        stock,
        brand,
      });
      await product.save();
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Product.findByIdAndDelete(id);
      if (!result) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { image, name, description, rating, pricecents, keywords, category, stock, brand } = req.body;
      const updated = await Product.findByIdAndUpdate(
        id,
        {
          image,
          name,
          description,
          rating: rating?.stars || 0,
          pricecents,
          keywords,
          category,
          stock,
          brand,
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

export default productController;
