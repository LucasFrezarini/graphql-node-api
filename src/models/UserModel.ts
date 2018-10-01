import * as bcrypt from "bcrypt";
import * as Sequelize from "sequelize";
import { IBaseModel } from "../interfaces/IBaseModel";
import { IModels } from "../interfaces/IModels";
import logger from "../logging/logger";

export interface IUserAttributes {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserInstance extends Sequelize.Instance<IUserAttributes>, IUserAttributes {
  isPassword(encodedPassword: string, password: string): boolean;
}

export interface IUserModel extends  IBaseModel, Sequelize.Model<IUserInstance, any> {}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): IUserModel => {
   // tslint:disable:object-literal-sort-keys
  const User: IUserModel =  sequelize.define("User", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(128),
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING(128),
      unique: true,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING(128),
      validate: {
        notEmpty: true,
      },
    },
    photo: {
      type: DataTypes.BLOB({
        length: "long",
      }),
      allowNull: true,
      defaultValue: null,
    },
  }, {
    tableName: "users",
    hooks: {
      beforeCreate: async (user: IUserInstance, options: Sequelize.CreateOptions) => {
        try {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        } catch (err) {
          logger.error(err);
        }
      },
    },
  });

  User.prototype.isPassword =  async (encodedPassword: string, password: string): Promise<boolean> =>
    await bcrypt.compareSync(password, encodedPassword);

  return User;
};
