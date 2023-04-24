const apiErrorHandler = (err, req, res, next) => {
  if (err?.name === "ValidationError") {
    const errors = {};
    for (let field in err?.errors) {
      errors[field] = err?.errors[field].message;
    }
    return res.status(422).json({
      error: {
        name: err?.name,
        message: errors,
      },
    });
  }

  next(err);
};

module.exports = apiErrorHandler;
