const { NotFoundError } = require('./errorHandler');

function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
}

module.exports = { notFoundHandler };