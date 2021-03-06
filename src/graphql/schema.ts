import { makeExecutableSchema } from "graphql-tools";
import { merge } from "lodash";
import { Mutation } from "./mutation";
import { Query } from "./query";

import { commentResolvers } from "./resources/comment/comment.resolvers";
import { postResolvers } from "./resources/post/post.resolvers";
import { tokenResolvers } from "./resources/token/token.resolvers";
import { userResolvers } from "./resources/user/user.resolvers";

import { commentTypes } from "./resources/comment/comment.schema";
import { postTypes } from "./resources/post/post.schema";
import { tokenTypes } from "./resources/token/token.schema";
import { userTypes } from "./resources/user/user.schema";

const resolvers = merge(
  commentResolvers,
  userResolvers,
  postResolvers,
  tokenResolvers,
);

const SchemaDefinition = `
  type Schema {
    query: Query
    mutation: Mutation
  }
`;

export default makeExecutableSchema({
  resolvers,
  typeDefs: [
    SchemaDefinition,
    Mutation,
    Query,
    commentTypes,
    userTypes,
    tokenTypes,
    postTypes,
  ],
});
