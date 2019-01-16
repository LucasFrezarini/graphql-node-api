import * as compression from "compression";
import * as cors from "cors";
import * as express from "express";
import * as graphqlHTTP from "express-graphql";
import * as helmet from "helmet";

import schema from "./graphql/schema";
import db from "./models";

import { RequestedFields } from "./graphql/ast/RequestedFields";
import { DataLoaderFactory } from "./graphql/dataloaders/DataLoaderFactory";
import { extreactJwtMiddleware } from "./middlewares/extract-jwt-middleware";

class App {
  public readonly application: express.Application;

  private dataLoaderFactory: DataLoaderFactory;
  private requestedFields: RequestedFields;

  constructor() {
    this.application = express();
    this.init();
  }

  private init(): void {
    this.middleware();
    this.requestedFields = new RequestedFields();
    this.dataLoaderFactory = new DataLoaderFactory(db, this.requestedFields);
  }

  private middleware(): void {
    this.application.use(cors({
      allowedHeaders: ["Content-Type", "Authorization", "Accept-Enconding"],
      methods: ["GET", "POST", "OPTIONS"],
      optionsSuccessStatus: 204,
      origin: "*",
      preflightContinue: false,
    }));

    this.application.use(compression());
    this.application.use(helmet());

    this.application.use("/graphql",
      extreactJwtMiddleware(),
      (req, res, next) => {
        // tslint:disable:no-string-literal
        req["context"]["db"] = db;
        req["context"]["dataLoaders"] = this.dataLoaderFactory.getLoaders(),
          req["context"]["requestedFields"] = this.requestedFields;
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
