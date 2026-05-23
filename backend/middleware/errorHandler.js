const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
  res.status(status).json({
    success: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

export default errorHandler;
