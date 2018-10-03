import * as fs from "fs";
import * as path from "path";
import * as Sequelize from "sequelize";
import { IDbConnection } from "../interfaces/IDbConnection";

const basename: string = path.basename(module.filename);
const env: string = process.env.NODE_ENV || "development";

// tslint:disable-next-line:no-var-requires
const config = require(path.resolve(`${__dirname}`, `./../config/config.json`))[env];

let db = null;

if (!db) {
  db = {};

  const operatorsAliases = false;

  const sequelize: Sequelize.Sequelize = new Sequelize(Object.assign(config, { operatorsAliases }));

  fs.readdirSync(__dirname)
    .filter((file: string) => (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js"))
    .forEach((file: string) => {
      const model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach((model: string) => {
    if (db[model].associate) {
      db[model].associate(db);
    }
  });

  db.sequelize = sequelize;
}

export default db as IDbConnection;
