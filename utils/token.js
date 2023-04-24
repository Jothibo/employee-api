const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../config");
const { UnAuthorizedError } = require("../error_handlers/customErrors");
const { isDevelopment } = require("./currentEnv");

const generateAccessToken = (data) => {
  try {
    return jwt.sign(data, ACCESS_TOKEN_SECRET, { expiresIn: "10m" });
  } catch (error) {
    console.error("Access Token Generate Error : ", error);
    return null;
  }
};

const generateRefreshToken = (data) => {
  try {
    return jwt.sign(data, REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
  } catch (error) {
    console.error("Refresh Token Generate Error : ", error);
    return null;
  }
};

const isAdmin = (req, res, next) => {
  const adminToken = req?.cookies?.adminToken;
  if (adminToken && adminToken === "IAM_ADMIN") {
    next();
  } else {
    next(new UnAuthorizedError("Invalid Token"));
  }
};

const authenticateUser = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    next(new UnAuthorizedError("Token missing"));
  } else {
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          const refreshToken = req.cookies.refreshToken;
          if (!refreshToken) {
            next(new UnAuthorizedError("Refresh Token missing"));
          } else {
            jwt.verify(
              refreshToken,
              REFRESH_TOKEN_SECRET,
              (err, decodedData) => {
                if (err) {
                  next(new UnAuthorizedError("Refresh Token expired"));
                } else {
                  const tokenPayload = { email: decodedData.email };
                  const accessToken = generateAccessToken(tokenPayload);
                  if (!accessToken)
                    next(
                      new CustomError(
                        "Internal Server Error - Token generation failed"
                      )
                    );
                  else {
                    res.cookie("accessToken", accessToken, {
                      httpOnly: true,
                      maxAge: 7 * 24 * 60 * 60 * 1000,
                      sameSite: "None",
                      secure: !isDevelopment,
                    });
                    req.user = { email: decodedData.email };
                    next();
                  }
                }
              }
            );
          }
        } else {
          next(new UnAuthorizedError("Token expired"));
        }
      } else {
        req.user = { email: decoded.email };
        next();
      }
    });
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  isAdmin,
  authenticateUser,
};
