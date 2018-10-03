import * as Sequelize from "sequelize";
import { IBaseModel } from "../interfaces/IBaseModel";

export interface ICommentAttributes {
  id?: number;
  comment?: string;
  post?: number;
  user?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentInstance extends Sequelize.Instance<ICommentAttributes> {}

export interface ICommentModel extends IBaseModel, Sequelize.Model<ICommentInstance, any> {}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): ICommentModel => {

  const Comment: ICommentModel = sequelize.define("Comment", {
    // tslint:disable:object-literal-sort-keys
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    comment: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
  }, {
    tableName: "comments",
  });

  Comment.associate = (models) => {

    Comment.belongsTo(models.Post, {
      foreignKey: {
        allowNull: false,
        field: "post",
        name: "post",
      },
    });

    Comment.belongsTo(models.User, {
      foreignKey: {
        allowNull: false,
        field: "user",
        name: "user",
      },
    });
  };

  return Comment;
};
