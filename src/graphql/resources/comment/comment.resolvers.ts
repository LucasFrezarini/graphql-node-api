import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { IDbConnection } from "../../../interfaces/IDbConnection";
import { ICommentInstance } from "../../../models/CommentModel";
import { handleError } from "../../../utils/utils";

export const commentResolvers = {
  Comment: {
    user: (parent: ICommentInstance, args, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
      db.User.findById(parent.get("user")).catch(handleError),

    post: (parent: ICommentInstance, args, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
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
    createComment: (parent, { input }, { db }: { db: IDbConnection }, info) =>
      db.sequelize.transaction((t: Transaction) =>
        db.Comment.create(input, { transaction: t}),
      ).catch(handleError),

    updateComment: (parent, { id, input }, { db }: { db: IDbConnection }, info) =>
      db.sequelize.transaction(async (t: Transaction) => {
        id = parseInt(id, 10);
        const comment = await db.Comment.findById(id);

        if (!comment) {
          throw new Error(`Comment with id ${id} not found!`);
        }

        return comment.update(input);
      }).catch(handleError),

      deleteComment: (parent, { id }, { db }: { db: IDbConnection }, info) =>
        db.sequelize.transaction(async (t: Transaction) => {
          id = parseInt(id, 10);
          const comment = await db.Comment.findById(id);

          if (!comment) {
            throw new Error(`Comment with id ${id} not found!`);
          }

          const result = comment.destroy();

          return Boolean(result);
        }).catch(handleError),
  },
};
