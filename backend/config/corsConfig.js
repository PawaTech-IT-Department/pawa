// CORS configuration for the e-commerce platform
const corsConfig = {
  origin: [
    "http://localhost:5502",
    "http://127.0.0.1:5502"
    // Add production frontend URLs here
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

export default corsConfig;
