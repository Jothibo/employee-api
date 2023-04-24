const { NODE_ENV } = require("../config");

const isDevelopment = () => {
  const env = NODE_ENV || "development";
  return env === "development";
};

module.exports.isDevelopment = isDevelopment();
