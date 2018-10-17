import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { IDbConnection } from "../../../interfaces/IDbConnection";
import { IResolverContext } from "../../../interfaces/IResolverContext";
import { IPostInstance } from "../../../models/PostModel";
import { handleError, throwError } from "../../../utils/utils";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";

export const postResolvers = {
  Post: {
    author: (parent: IPostInstance, { id }, { db }: {db: IDbConnection}, info: GraphQLResolveInfo) =>
      db.User.findById(parent.get("author")).catch(handleError),

    comments: (
      parent: IPostInstance, { first = 10, offset = 0 }, { db }: {db: IDbConnection}, info: GraphQLResolveInfo) =>
        db.Comment.findAll({
          limit: first,
          offset,
          where: { post: parent.get("id") },
        }).catch(handleError),
  },

  Query: {
    posts: (parent: IPostInstance,
            { first = 10, offset = 0 }, { db }: {db: IDbConnection}, info: GraphQLResolveInfo) =>
              db.Post.find({
                limit: first,
                offset,
              }).catch(handleError),

    post: async (parent: IPostInstance, { id }, { db }: {db: IDbConnection}, info: GraphQLResolveInfo) => {
      try {
        id = parseInt(id, 10);
        const post = await db.Post.findById(id);

        throwError(!post, `Post with id ${id} not found!`);

        return post;
      } catch (err) {
        return handleError(err);
      }
    },
  },

  Mutation: {
    createPost: compose(...authResolvers)
    ((parent, { input }, { db, authUser }: IResolverContext, info: GraphQLResolveInfo) =>
      db.sequelize.transaction((t: Transaction) => {
        input.author = authUser.id;
        return db.Post.create(input, { transaction: t });
      }).catch(handleError)),

    updatePost: compose(...authResolvers)
    ((parent, { id, input }, { db, authUser }: IResolverContext, info: GraphQLResolveInfo) =>
      db.sequelize.transaction(async (t: Transaction) => {
        id = parseInt(id, 10);
        const post = await db.Post.findById(id);

        throwError(!post, `Post with id ${id} not found!`);
        throwError(post.get("author") !== authUser.id,  `You can only edit posts created by yourself!`);
        input.author = authUser.id;

        return post.update(input, {transaction: t});
      }).catch(handleError)),

      deletePost: compose(...authResolvers)
      ((parent, { id }, { db, authUser }: IResolverContext, info: GraphQLResolveInfo) =>
        db.sequelize.transaction(async (t: Transaction) => {
          id = parseInt(id, 10);
          const post = await db.Post.findById(id);

          throwError(!post, `Post with id ${id} not found!`);
          throwError(post.get("author") !== authUser.id,  `You can only delete posts created by yourself!`);

          const result = await post.destroy();
          return Boolean(result);
        }).catch(handleError)),
  },
};
