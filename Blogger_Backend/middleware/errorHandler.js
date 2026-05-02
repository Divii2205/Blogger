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

  // err.details is structured payload meant for the client (e.g. validation
  // errors) — always send it. Stack traces are debug-only, dev environments
  // only.
  let details;
  if (err.details !== undefined && err.details !== null) {
    details = err.details;
  } else if (process.env.NODE_ENV === "development" && !isOperational) {
    details = err.stack;
  }

  return sendError(
    res,
    err.message || "Internal server error",
    statusCode,
    details
  );
};

module.exports = errorHandler;
