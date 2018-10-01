import * as Sequelize from "sequelize";
import { IModels } from "./IModels";

export interface IDbConnection extends IModels {
  sequelize: Sequelize.Sequelize;
}
