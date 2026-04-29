const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const requestId = req.requestId || "unknown";
    const userId = req.user?._id ? String(req.user._id) : "anonymous";

    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} ${durationMs}ms reqId=${requestId} user=${userId}`
    );
  });

  next();
};

module.exports = requestLogger;
