const AppError = require("../utils/appError");
const { sendError } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err instanceof AppError || err.isOperational;

  if (!isOperational) {
    console.error("Unhandled error:", {
      requestId: req.requestId,
      message: err.message,
      stack: err.stack,
    });
  }

  return sendError(
    res,
    err.message || "Internal server error",
    statusCode,
    process.env.NODE_ENV === "development" ? err.details || err.stack : undefined
  );
};

module.exports = errorHandler;
