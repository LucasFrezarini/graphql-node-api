export const userTypes = `
  # user definition type
  type User {
    id: ID!
    name: String!
    email: String!
    photo: String
    createdAt: String!
    updatedAt: String!
  }

  input userCreateInput {
    name: String!
    email: String!
    password: String!
  }

  input userUpdateInput {
    name: String!
    email: String!
    photo: String!
  }

  input userUpdatePasswordInput {
    password: String!
  }
`;

export const userQueries = `
  users(first: Int, offset: Int): [ User! ]!
  user(id: ID!): User
`;

export const userMutations = `
  createUser(input: userCreateInput!): User
  updateUser(id: ID!, input: userUpdateInput!): User
  updateUserPassword(id: ID!, input: userUpdatePasswordInput!): Boolean
  delete(id: ID!): Boolean
`;
