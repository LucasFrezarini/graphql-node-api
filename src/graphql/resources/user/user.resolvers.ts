import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { IDbConnection } from "../../../interfaces/IDbConnection";
import UserModel, { IUserInstance } from "../../../models/UserModel";
import { handleError } from "../../../utils/utils";

export const userResolvers = {
  User: {
    posts: (parent: IUserInstance,
            { first = 10, offset = 0 }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
      db.Post.findAll({
        limit: first,
        offset,
        where: { author: parent.get("id") },
      }).catch(handleError),
  },

  Query: {
    users: (parent, { first = 10, offset = 0 }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
      db.User.findAll({
        limit: first,
        offset,
      }).catch(handleError),

    user: async (parent, { id }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) => {
      try {
        id = parseInt(id, 10);
        const user = await db.User.findById(id);

        if (!user) {
          throw new Error(`User with id ${id} not found!`);
        }

        return user;
      } catch (err) {
        return handleError(err);
      }
    },
  },

  Mutation: {
    createUser: (parent, { input }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
      db.sequelize.transaction((t: Transaction) =>
        db.User.create(input, { transaction: t }),
      ).catch(handleError),

    updateUser: (parent, { id, input }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
      db.sequelize.transaction(async (t: Transaction) => {
        id = parseInt(id, 10);
        const user = await db.User.findById(id);

        if (!user) {
          throw new Error(`User with id ${id} not found!`);
        }

        return user.update(input);
      }).catch(handleError),

      updateUserPassword:  (parent, { id, input }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
        db.sequelize.transaction(async (t: Transaction) => {
          id = parseInt(id, 10);
          const user = await db.User.findById(id);

          if (!user) {
            throw new Error(`User with id ${id} not found!`);
          }

          const result = await user.update(input, {transaction: t});

          return Boolean(result);
        }).catch(handleError),

      deleteUser: (parent, { id }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
        db.sequelize.transaction(async (t: Transaction) => {
          id = parseInt(id, 10);
          const user = await db.User.findById(id);

          if (!user) {
            throw new Error(`User with id ${id} not found!`);
          }

          const result = await user.destroy({transaction: t});

          return Boolean(result);
        }).catch(handleError),
  },
};
