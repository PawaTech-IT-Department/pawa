// API configuration for the e-commerce platform
const apiConfig = {
  baseUrl: "/api",
  version: "v1",
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 60 // max requests per window per IP
  }
};

export default apiConfig;
