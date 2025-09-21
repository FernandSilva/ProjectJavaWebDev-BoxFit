import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  redact: {
    paths: [
      'req.headers.authorization',
      'headers.authorization',
      'config.key',                 // Appwrite API key
      'process.env.APPWRITE_API_KEY'
    ],
    remove: true
  },
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          singleLine: false
        }
      }
});

export default logger;
