const express = require("express");
const { REGISTER, LOGIN, LOGOUT } = require("../controllers/userController");
const { CustomError } = require("../error_handlers/customErrors");
const USER = require("../models/userModel");
const { isAdmin } = require("../utils/token");

const router = express.Router();

const getUserByEmailId = async (email) => await USER.findOne({ email });

const existingUser = async (req, res, next) => {
  try {
    const user = await getUserByEmailId(req?.body?.email);
    console.log(user);
    if (user) next(new CustomError("Email already exists", 409));
    else next();
  } catch (error) {
    next(error);
  }
};

router.post("/register", existingUser, REGISTER);
router.post("/login", LOGIN);
router.get("/logout", LOGOUT);

module.exports = router;
