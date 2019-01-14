import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { IResolverContext } from "../../../interfaces/IResolverContext";
import { IPostInstance } from "../../../models/PostModel";
import { handleError, throwError } from "../../../utils/utils";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";

export const postResolvers = {
  Post: {
    author: (parent: IPostInstance, args, { dataLoaders: {userLoader} }: IResolverContext,
             info: GraphQLResolveInfo) => userLoader.load({key: parent.get("author"), info}).catch(handleError),

    comments: (
      parent: IPostInstance, { first = 10, offset = 0 }, { db, requestedFields }: IResolverContext,
      info: GraphQLResolveInfo) =>
        db.Comment.findAll({
          attributes: requestedFields.getFields(info),
          limit: first,
          offset,
          where: { post: parent.get("id") },
        }).catch(handleError),
  },

  Query: {
    posts: (parent: IPostInstance,
            { first = 10, offset = 0 }, { db, requestedFields }: IResolverContext, info: GraphQLResolveInfo) =>
              db.Post.findAll({
                attributes: requestedFields.getFields(info, {keep: ["id"], exclude: ["comments"]}),
                limit: first,
                offset,
              }).catch(handleError),

    post: async (parent: IPostInstance, { id }, { db, requestedFields }: IResolverContext,
                 info: GraphQLResolveInfo) => {
      try {
        id = parseInt(id, 10);
        const post = await db.Post.findByPk(id, {
          attributes: requestedFields.getFields(info, {keep: ["id"], exclude: ["comments"]}),
        });

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
        const post = await db.Post.findByPk(id);

        throwError(!post, `Post with id ${id} not found!`);
        throwError(post.get("author") !== authUser.id,  `You can only edit posts created by yourself!`);
        input.author = authUser.id;

        return post.update(input, {transaction: t});
      }).catch(handleError)),

      deletePost: compose(...authResolvers)
      ((parent, { id }, { db, authUser }: IResolverContext, info: GraphQLResolveInfo) =>
        db.sequelize.transaction(async (t: Transaction) => {
          id = parseInt(id, 10);
          const post = await db.Post.findByPk(id);

          throwError(!post, `Post with id ${id} not found!`);
          throwError(post.get("author") !== authUser.id,  `You can only delete posts created by yourself!`);

          const result = await post.destroy();
          return Boolean(result);
        }).catch(handleError)),
  },
};
