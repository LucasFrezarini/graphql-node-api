import * as winston from "winston";

class Logger {
  public createLogger() {
    const loggerInstance = winston.createLogger({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple(),
      ),
      silent: (process.env.NODE_ENV === "test"),
      transports: [new winston.transports.Console({
        handleExceptions: true,
      })],
    });

    return loggerInstance;
  }
}

export default new Logger().createLogger();
