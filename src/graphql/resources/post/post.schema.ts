export const postTypes = `

  # Post definition schema
  type Post {
    id: ID!
    title: String!
    content: String!
    photo: String!
    createdAt: String!
    updatedAt: String!
    author: User!
    comments(first: Int, offset: Int): [ Comment! ]!
  }

  input PostInput {
    title: String!
    content: String!
    photo: String!
  }
`;

export const postQueries = `
  posts(first: Int, offset: Int): [ Post! ]!
  post(id: ID!): Post
`;

export const postMutations = `
  createPost(input: PostInput!): Post
  updatePost(id: ID!, input: PostInput!): Post
  deletePost(id: ID!): Boolean
`;
