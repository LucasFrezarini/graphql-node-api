import logger from "../logging/logger";

export const handleError = (error: Error) => {
  const errorMessage = `${error.name}: ${error.message}`;
  logger.error(errorMessage);
  return Promise.reject(new Error(errorMessage));
};
