const {
  NotFoundError,
  UnAuthorizedError,
  CustomError,
} = require("../error_handlers/customErrors");
const USER = require("../models/userModel");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const { userHandler } = require("../utils/responseHandler");
const { isDevelopment } = require("../config");
const REGISTER = async (req, res, next) => {
  try {
    const payload = req.body;
    const newUser = await USER.create(payload);
    return res.status(201).json({ success: true, user: userHandler(newUser) });
  } catch (err) {
    next(err);
  }
};

const LOGIN = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const isUserFound = await USER.findOneByEmail(email);
    if (isUserFound) {
      if (!isUserFound.isActive) {
        next(new UnAuthorizedError("Account is not active"));
      } else {
        const isPasswordMatch = await isUserFound.checkPasswordMatch(password);
        if (isPasswordMatch) {
          const tokenPayload = { email: isUserFound.email };
          const accessToken = generateAccessToken(tokenPayload);
          const refreshToken = generateRefreshToken(tokenPayload);
          if (accessToken && refreshToken) {
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              maxAge: 7 * 24 * 60 * 60 * 1000,
              sameSite: "None",
              secure: !isDevelopment,
            });
            res.cookie("accessToken", accessToken, {
              httpOnly: true,
              maxAge: 7 * 24 * 60 * 60 * 1000,
              sameSite: "None",
              secure: !isDevelopment,
            });
            if (isUserFound["role"] === "ADMIN") {
              res.cookie("adminToken", "IAM_ADMIN", {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: "None",
                secure: !isDevelopment,
              });
            }
            return res.json({ success: true, user: userHandler(isUserFound) });
          } else {
            next(
              new CustomError("Internal Server Error - Token generation failed")
            );
          }
        } else {
          next(new UnAuthorizedError("Password is incorrect"));
        }
      }
    } else {
      next(new NotFoundError("User not found"));
    }
  } catch (err) {
    next(err);
  }
};

const GET_ALL_USERS = async (req, res, next) => {
  try {
    const isUserFound = await USER.findOneByEmail(req.user.email);
    if (isUserFound) {
      if (
        isUserFound?.role === "HR" ||
        isUserFound?.role === "ADMIN" ||
        isUserFound?.role === "MANAGER"
      ) {
        const query = { isActive: true };
        if (isUserFound?.role !== "ADMIN")
          query.role = { $nin: ["HR", "ADMIN"] };
        const users = await USER.find(query);
        const modifiedUsers = users.map((user) => userHandler(user));
        return res.status(200).json({ success: true, users: modifiedUsers });
      } else {
        next(new CustomError("Forbidden", 403));
      }
    } else {
      next(new NotFoundError("User not found"));
    }
  } catch (error) {
    next(error);
  }
};

const ME = async (req, res, next) => {
  try {
    const isUserFound = await USER.findOneByEmail(req.user.email);
    return res
      .status(200)
      .json({ success: true, user: userHandler(isUserFound) });
  } catch (error) {
    next(error);
  }
};

const LOGOUT = async (req, res, next) => {
  try {
    res.cookie("refreshToken", null, {
      httpOnly: true,
      maxAge: 0,
      sameSite: "None",
      secure: !isDevelopment,
    });
    res.cookie("accessToken", null, {
      httpOnly: true,
      maxAge: 0,
      sameSite: "None",
      secure: !isDevelopment,
    });
    res.cookie("adminToken", null, {
      httpOnly: true,
      maxAge: 0,
      sameSite: "None",
      secure: !isDevelopment,
    });

    return res.json({ success: true, msg: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { REGISTER, LOGIN, GET_ALL_USERS, ME, LOGOUT };
