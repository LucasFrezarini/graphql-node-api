import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { IDbConnection } from "../../../interfaces/IDbConnection";
import { IPostInstance } from "../../../models/PostModel";
import { handleError } from "../../../utils/utils";

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

        if (!post) {
          throw new Error(`Post with id ${id} not found!`);
        }

        return post;
      } catch (err) {
        return handleError(err);
      }
    },
  },

  Mutation: {
    createPost: (parent, { input }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
      db.sequelize.transaction((t: Transaction) =>
        db.Post.create(input, { transaction: t }),
      ).catch(handleError),

    updatePost: (parent, { id, input }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
      db.sequelize.transaction(async (t: Transaction) => {
        id = parseInt(id, 10);
        const post = await db.Post.findById(id);

        if (!post) {
          throw new Error(`Post with id ${id} not found!`);
        }

        return post.update(input, {transaction: t});
      }).catch(handleError),

      deletePost: (parent, { id }, { db }: { db: IDbConnection }, info: GraphQLResolveInfo) =>
        db.sequelize.transaction(async (t: Transaction) => {
          id = parseInt(id, 10);
          const post = await db.Post.findById(id);

          if (!post) {
            throw new Error(`Post with id ${id} not found!`);
          }

          const result = await post.destroy();
          return Boolean(result);
        }).catch(handleError),
  },
};
