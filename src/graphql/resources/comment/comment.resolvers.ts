import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { IDbConnection } from "../../../interfaces/IDbConnection";
import { IResolverContext } from "../../../interfaces/IResolverContext";
import { ICommentInstance } from "../../../models/CommentModel";
import { handleError, throwError } from "../../../utils/utils";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";

export const commentResolvers = {
  Comment: {
    user: (parent: ICommentInstance, args, { db }: IResolverContext, info: GraphQLResolveInfo) =>
      db.User.findById(parent.get("user")).catch(handleError),

    post: (parent: ICommentInstance, args, { db }: IResolverContext, info: GraphQLResolveInfo) =>
      db.Post.findById(parent.get("post")).catch(handleError),
  },

  Query: {
    commentsByPost: (
      parent, { postId, first = 10, offset = 0 }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
        db.Comment.findAll({
          limit: first,
          offset,
          where: { post: parseInt(postId, 10) },
        }).catch(handleError),
  },

  Mutation: {
    createComment: compose(...authResolvers)((parent, { input }, { db, authUser }: IResolverContext, info) =>
      db.sequelize.transaction((t: Transaction) => {
        input.user = authUser.id;
        return db.Comment.create(input, { transaction: t});
      }).catch(handleError)),

    updateComment: compose(...authResolvers)((parent, { id, input }, { db, authUser }: IResolverContext, info) =>
      db.sequelize.transaction(async (t: Transaction) => {
        id = parseInt(id, 10);
        const comment = await db.Comment.findById(id);

        throwError(!comment, `Comment with id ${id} not found!`);
        throwError(comment.get("user") !== authUser.id,  `You can only edit comments created by yourself!`);

        return comment.update(input);
      }).catch(handleError)),

      deleteComment: compose(...authResolvers)((parent, { id }, { db, authUser }: IResolverContext, info) =>
        db.sequelize.transaction(async (t: Transaction) => {
          id = parseInt(id, 10);
          const comment = await db.Comment.findById(id);

          throwError(!comment, `Comment with id ${id} not found!`);
          throwError(comment.get("user") !== authUser.id,  `You can only delete comments created by yourself!`);

          const result = comment.destroy();

          return Boolean(result);
        }).catch(handleError)),
  },
};
