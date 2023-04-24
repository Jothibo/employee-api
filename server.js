const express = require("express");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const { PORT, NODE_ENV } = require("./config");
const mongoose = require("mongoose");
const connectDB = require("./utils/connectDB");
const errorHandler = require("./error_handlers/errorHandler");
const { NotFoundError, CustomError } = require("./error_handlers/customErrors");
const requestMiddleware = require("./middlewares/requestMiddleware");
const apiErrorHandler = require("./error_handlers/apiErrorHandler");
const Logger = require("./utils/Logger");
const app = express();
app.disable("x-powered-by");
//Middlewares
// 1. Request middleware
if (NODE_ENV === "development") {
  app.use(requestMiddleware);
}
// 2. Request JSON body parser middleware
app.use(express.json());

// // 4. Compression middleware
// const shouldCompress = (req, res) => {
//   if (req.headers["Accept-Encoding"]) {
//     return false;
//   }
//   return compression.filter(req, res);
// };
// app.use(
//   compression({
//     filter: shouldCompress,
//     threshold: 0,
//   })
// );

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://employee-performance-web.vercel.app",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);
// 3. Cookie parser middleware
app.use(cookieParser());
//Connect to MongoDB
connectDB();
const db = mongoose.connection;
//Removing _id and --v, Adding virtuals while return docs from mongodb
mongoose.set("toJSON", {
  virtuals: true,
  versionKey: false,
  getters: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

db.on("error", console.error.bind(console, "Connection Error :"));

app.get("/", (req, res) => res.send("Hello World!"));

//No-Contet for favicon.ico
app.get("/favicon.ico", (req, res) => res.status(204).json());

//MongoDB routes
app.use("/api", require("./routes"));

//Error handler for the not found route.
app.use((req, res, next) => {
  const message = "Request not found";
  const err = new NotFoundError(`${message} for path ${req.path}`);
  next(err);
});

app.use(apiErrorHandler);

//Error Handler
app.use(errorHandler);

//Make sure our server is listen after sucessfully connected with mongodb
db.once("open", () =>
  app.listen(PORT, () =>
    Logger.info(`Example app listening on http://localhost:${PORT}`)
  )
);
