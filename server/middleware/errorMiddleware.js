// Unsupported (404) routes
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.code = 404;
  res.status(404);
  next(error);
};

// Middleware to handle Errors
const errorHandler = (error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  const statusCode = error.code || error.status || 500;
  res
    .status(statusCode)
    .json({ message: error.message || "An unknown error occured" });
};

module.exports = { notFound, errorHandler };