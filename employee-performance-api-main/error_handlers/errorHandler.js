const { NODE_ENV } = require("../config");
const Logger = require("../utils/Logger");
const errorHandler = (error, req, res, next) => {
  // Error handling middleware functionality
  if (NODE_ENV === "development") {
    Logger.error(`${error.name} :  ${error.message} - ${error.stack}`); // log the error
  }
  const status = error.status || error?.statusCode || 400;
  // send back an easily understandable error message to the caller
  return res.status(status).json({
    error: {
      name: error?.name,
      message: error?.message,
    },
  });
};

module.exports = errorHandler;
