import * as cluster from "cluster";
import { CpuInfo, cpus } from "os";
import logger from "./logging/logger";

class Clusters {

  private cpus: CpuInfo[];

  constructor() {
    this.cpus = cpus();
    this.init();
  }

  private init() {
    if (cluster.isMaster) {
      this.cpus.forEach(cluster.fork);

      cluster.on("listening", (worker) => {
        logger.info(`Cluster ${worker.process.pid} connected`);
      });

      cluster.on("disconnect", (worker) => {
        logger.info(`Cluster ${worker.process.pid} disconnected`);
      });

      cluster.on("exit", (worker) => {
        logger.info(`Cluster ${worker.process.pid} exited`);
        cluster.fork();
      });
    } else {
      import("./index");
    }
  }
}

export default new Clusters();
