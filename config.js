require("dotenv").config();
const ENV = process.env;
module.exports = {
  PORT: ENV.PORT || "5000",
  NODE_ENV: ENV.NODE_ENV || "development",
  MONGO_URI: ENV.MONGO_URI,
  SALT_ROUNDS: parseInt(ENV.SALT_ROUNDS),
  ACCESS_TOKEN_SECRET: ENV.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: ENV.REFRESH_TOKEN_SECRET,
};
