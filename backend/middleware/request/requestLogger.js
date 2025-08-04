// Logs incoming requests with method, URL, and timestamp
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};
export default requestLogger;;
