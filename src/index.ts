import * as http from "http";
import app from "./app";
import logger from "./logging/logger";
import db from "./models";

const initialize = async () => {
    try {
        await db.sequelize.sync();
        const server = http.createServer(app);
        const port = process.env.port || 3000;
        server.listen(port);

        server.on("listening", () => {
            logger.info(`Server running at port ${port}`);
        });

        server.on("error", logger.error.bind(logger));
    } catch (err) {
        logger.error(err);
    }
};

initialize();
