import * as express from "express";

class App {
    public readonly application: express.Application;

    constructor() {
        this.application = express();
        this.middleware();
    }

    private middleware(): void {
        this.application.use("/hello", (req, res, next) => {
            res.send({hello: "world"});
        });
    }
}

export default new App().application;
