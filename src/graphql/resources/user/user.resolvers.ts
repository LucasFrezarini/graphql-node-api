import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { IDbConnection } from "../../../interfaces/IDbConnection";
import { IResolverContext } from "../../../interfaces/IResolverContext";
import { IUserInstance } from "../../../models/UserModel";
import { handleError, throwError } from "../../../utils/utils";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";

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
    users: (parent, { first = 10, offset = 0 }, { db }: IResolverContext, info: GraphQLResolveInfo) =>
        db.User.findAll({
          limit: first,
          offset,
        }).catch(handleError),

    user: async (parent, { id }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) => {
      try {
        id = parseInt(id, 10);
        const user = await db.User.findById(id);

        throwError(!user, `User with id ${id} not found!`);

        return user;
      } catch (err) {
        return handleError(err);
      }
    },

    currentUser: compose(...authResolvers)
      (async (parent, args, { db, authUser }: IResolverContext, info: GraphQLResolveInfo) => {
        try {
          const user = await db.User.findById(authUser.id);

          throwError(!user, `User with id ${authUser.id} not found!`);

          return user;
        } catch (err) {
          return handleError(err);
        }
    }),
  },

  Mutation: {
    createUser: (parent, { input }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
      db.sequelize.transaction((t: Transaction) =>
        db.User.create(input, { transaction: t }),
      ).catch(handleError),

    updateUser: compose(...authResolvers)
      ((parent, { input }, { db, authUser }: IResolverContext, info: GraphQLResolveInfo) =>
        db.sequelize.transaction(async (t: Transaction) => {
          const user = await db.User.findById(authUser.id);

          throwError(!user, `User with id ${authUser.id} not found!`);

          return user.update(input, { transaction: t });
        }).catch(handleError)),

        updateUserPassword: compose(...authResolvers)
          ((parent, { input }, { db, authUser }: IResolverContext, info: GraphQLResolveInfo) =>
            db.sequelize.transaction(async (t: Transaction) => {
              const user = await db.User.findById(authUser.id);

              throwError(!user, `User with id ${authUser.id} not found!`);

              const result = await user.update(input, {transaction: t});

              return Boolean(result);
            }).catch(handleError)),

      deleteUser: compose(...authResolvers)
        ((parent, args, { db, authUser }: IResolverContext, info: GraphQLResolveInfo) =>
          db.sequelize.transaction(async (t: Transaction) => {
            const user = await db.User.findById(authUser.id);

            throwError(!user, `User with id ${authUser.id} not found!`);

            const result = await user.destroy({transaction: t});

            return Boolean(result);
          }).catch(handleError)),
  },
};
