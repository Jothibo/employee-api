const mongoose = require("mongoose");
const { MONGO_URI } = require("../config");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Could not Connect to Database", error);
    process.exit(1);
  }
};

module.exports = connectDB;
