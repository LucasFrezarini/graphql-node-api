import * as Sequelize from "sequelize";

export interface IPostAttributes {
  id?: number;
  title?: string;
  content?: string;
  photo?: string;
  author?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPostInstance extends Sequelize.Instance<IPostAttributes>, IPostAttributes {}

export interface IPostModel extends Sequelize.Model<IPostInstance, any> {}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): IPostModel => {
  // tslint:disable:object-literal-sort-keys
  const Post: IPostModel = sequelize.define("Post", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    content: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    photo: {
      allowNull: false,
      get() {
        return this.getDataValue("photo").toString();
      },
      type: DataTypes.BLOB({
        length: "long",
      }),
    },
  }, {
    tableName: "posts",
  });

  Post.associate = (models: Sequelize.Models): void => {
    Post.belongsTo(models.User, {
      foreignKey: {
        allowNull: false,
        field: "author",
        name: "author",
      },
    });
  };

  return Post;
};
