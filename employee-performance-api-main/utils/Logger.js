const { createLogger, transports, format, addColors } = require("winston");
const { NODE_ENV } = require("../config");
const { combine, timestamp, label, printf, prettyPrint, colorize } = format;

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const isDevelopment = () => {
  const env = NODE_ENV || "development";
  return env === "development";
};
const level = () => {
  return isDevelopment() ? "debug" : "warn";
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
addColors(colors);

//defaults
const colorizer = colorize();
const defaultFormatter = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  prettyPrint(
    (info) => `${info.level.toUpperCase()} ${info.timestamp}  ${info.message}`
  )
);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
// const allTransports = [
//   // Allow the use the console to print the messages
//   //format color only to
//   new transports.Console({
//     format: combine(
//       // Tell Winston that the logs must be colored
//       //   colorize({ all: true }),
//       // Add the message timestamp with the preferred format
//       timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
//       // Define the format of the message showing the timestamp, the level and the message
//       //   printf((info) => `${info.level} ${info.timestamp}: ${info.message}`),

//       //Workaround for print timestamp with color
//       printf((info) =>
//         colorizer.colorize(
//           `${info.level}`,
//           `[RP ${
//             isDevelopment() ? "DEV" : "PROD"
//           } LOGGER] ${info.level.toUpperCase()} ${info.timestamp} : ${
//             info.message
//           }`
//         )
//       )
//     ),
//   }),
//   // Allow to print all the error level messages inside the error.log file
//   new transports.File({
//     filename: "logs/error.log",
//     level: "error",
//     format: defaultFormatter,
//   }),
//   // Allow to print all the error message inside the all.log file
//   // (also the error log that are also printed inside the error.log(
//   new transports.File({
//     filename: "logs/all.log",
//     format: defaultFormatter,
//   }),
// ];

const productionTransports = [
  // Allow the use the console to print the messages
  //format color only to
  new transports.Console({
    format: combine(
      // Tell Winston that the logs must be colored
      //   colorize({ all: true }),
      // Add the message timestamp with the preferred format
      timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
      // Define the format of the message showing the timestamp, the level and the message
      //   printf((info) => `${info.level} ${info.timestamp}: ${info.message}`),

      //Workaround for print timestamp with color
      printf((info) =>
        colorizer.colorize(
          `${info.level}`,
          `[RP ${
            isDevelopment() ? "DEV" : "PROD "
          } LOGGER] ${info.level.toUpperCase()} ${info.timestamp} : ${
            info.message
          }`
        )
      )
    ),
  }),
];

// Create the logger instance that has to be exported
// and used to log messages.
const Logger = isDevelopment()
  ? createLogger({
      level: level(),
      levels,
      transports: productionTransports,
    })
  : createLogger({
      level: level(),
      levels,
      transports: productionTransports,
    });

module.exports = Logger;
