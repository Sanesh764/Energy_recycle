/**
 * Centralized API Error Handling Middleware
 * SPEC.md Section 8: Return { error: "message" } with a proper status code on failure.
 * Do not expose internal stack traces or sensitive implementation details.
 */

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Resource not found' });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.expose || statusCode < 500 ? err.message : 'Internal server error';

  res.status(statusCode).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
