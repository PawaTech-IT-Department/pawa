import supabase from "./supabase/client.js";

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, keywords } = req.query;
    const from = (page - 1) * limit;
    const to = from + Number(limit) - 1;
    let query = supabase.from("products").select("*", { count: "exact" });

    // Filtering
    if (keywords) {
      const kwArr = keywords.split(",");
      query = query.contains("keywords", kwArr);
    }
    // Sorting
    const sortObj = parseSort(sort);
    if (sortObj) {
      query = query.order(sortObj.column, { ascending: sortObj.ascending });
    }
    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ products: data, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
