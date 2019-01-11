import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { IResolverContext } from "../../../interfaces/IResolverContext";
import { ICommentInstance } from "../../../models/CommentModel";
import { handleError, throwError } from "../../../utils/utils";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";

export const commentResolvers = {
  Comment: {
    user: (parent: ICommentInstance, args, { db, dataLoaders: {userLoader} }: IResolverContext,
           info: GraphQLResolveInfo) => userLoader.load({key: parent.get("user"), info}).catch(handleError),

    post: (parent: ICommentInstance, args, { db, dataLoaders: {postLoader} }: IResolverContext,
           info: GraphQLResolveInfo) => postLoader.load({key: parent.get("post"), info}).catch(handleError),
  },

  Query: {
    commentsByPost:
      (parent, { postId, first = 10, offset = 0 },
       { db, requestedFields }: IResolverContext, info: GraphQLResolveInfo) =>
        db.Comment.findAll({
          attributes: requestedFields.getFields(info),
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
