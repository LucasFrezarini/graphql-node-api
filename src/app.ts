import * as express from "express";
import * as graphqlHTTP from "express-graphql";

import schema from "./graphql/schema";

class App {
    public readonly application: express.Application;

    constructor() {
        this.application = express();
        this.middleware();
    }

    private middleware(): void {
        this.application.use("/graphql",  graphqlHTTP({
            graphiql: process.env.NODE_ENV === "development",
            schema,
        }));
    }
}

export default new App().application;
