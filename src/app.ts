import * as express from "express";
import * as graphqlHTTP from "express-graphql";

import schema from "./graphql/schema";
import db from "./models";

import { extreactJwtMiddleware } from "./middlewares/extract-jwt-middleware";

class App {
    public readonly application: express.Application;

    constructor() {
        this.application = express();
        this.middleware();
    }

    private middleware(): void {
        this.application.use("/graphql",
            extreactJwtMiddleware(),
            (req, res, next) => {
                // tslint:disable:no-string-literal
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
