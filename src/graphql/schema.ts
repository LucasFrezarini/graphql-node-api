import { makeExecutableSchema } from "graphql-tools";
import { Mutation } from "./mutation";
import { Query } from "./query";
import { userTypes } from "./resources/user/user.schema";
import { postTypes } from "./resources/post/post.schema";
import { commentTypes } from "./resources/comment/comment.schema";

const SchemaDefinition = `
  type Schema {
    query: Query
    mutation: Mutation
  }
`;
export default makeExecutableSchema({
  typeDefs: [
    SchemaDefinition,
    Mutation,
    Query,
    commentTypes,
    userTypes,
    postTypes,
  ],
});
