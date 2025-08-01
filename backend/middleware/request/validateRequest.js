// Validates request body for required fields (example for e-commerce order)
module.exports = function validateRequest(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => !(field in req.body));
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
    }
    next();
  };
}
