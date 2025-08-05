// Database configuration for the e-commerce platform
const dbConfig = {
  uri: process.env.MONGO_URI || "mongodb://localhost:27017/pawa",
  options: {
    // Add more mongoose options as needed
  }
};

export default dbConfig;
