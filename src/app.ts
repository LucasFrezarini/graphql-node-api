import * as express from "express";
import * as graphqlHTTP from "express-graphql";

import schema from "./graphql/schema";
import db from "./models";

class App {
    public readonly application: express.Application;

    constructor() {
        this.application = express();
        this.middleware();
    }

    private middleware(): void {
        this.application.use("/graphql",
            (req, res, next) => {
                // tslint:disable:no-string-literal
                req["context"] = {};
                req["context"].db = db;
                next();
            },
            graphqlHTTP((req) => ({
                context: req["context"],
                graphiql: process.env.NODE_ENV === "development",
                schema,
            }),
        ));
    }
}

export default new App().application;
