const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { SALT_ROUNDS } = require("../config");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Email required"],
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password required"],
  },
  employeeId: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    default: "EMPLOYEE",
    enum: ["EMPLOYEE", "MANAGER", "HR", "ADMIN"],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});
//virtuals
userSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

//Password encryption (invokes before save method)
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check if password matches
userSchema.methods.checkPasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//Static method tofind user by Email
userSchema.statics.findOneByEmail = async function (email) {
  return await this.findOne({ email });
};

module.exports = mongoose.model("User", userSchema);
