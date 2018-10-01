import * as http from "http";
import app from "./app";
import logger from "./logging/logger";

const server = http.createServer(app);

server.listen(3000);

server.on("listening", () => {
    logger.info("Server running at port 3000");
});

server.on("error", logger.error);
