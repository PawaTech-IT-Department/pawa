import supabase from '../supabase/client.js';

function parseSort(sort) {
  if (sort === 'price_asc') return { column: 'pricecents', ascending: true };
  if (sort === 'price_desc') return { column: 'pricecents', ascending: false };
  return null;
}

const productController = {
  getProducts: async (req, res) => {
    try {
      const { page = 1, limit = 10, sort, keywords } = req.query;
      const from = (page - 1) * limit;
      const to = from + Number(limit) - 1;
      let query = supabase.from('products').select('*', { count: 'exact' });
      if (keywords) {
        const kwArr = keywords.split(',');
        query = query.contains('keywords', kwArr);
      }
      const sortObj = parseSort(sort);
      if (sortObj) {
        query = query.order(sortObj.column, { ascending: sortObj.ascending });
      }
      query = query.range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      res.json({ products: data, total: count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Product not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const { image, name, rating, pricecents, keywords } = req.body;
      const { data, error } = await supabase.from('products').insert([
        {
          image,
          name,
          rating_stars: rating.stars,
          rating_count: rating.count,
          pricecents,
          keywords,
        },
      ]).select().single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { image, name, rating, pricecents, keywords } = req.body;
      const { data, error } = await supabase.from('products').update({
        image,
        name,
        rating_stars: rating.stars,
        rating_count: rating.count,
        pricecents,
        keywords,
      }).eq('id', id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default productController; 