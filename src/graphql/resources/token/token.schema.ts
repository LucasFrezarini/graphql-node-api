export const tokenTypes = `
  # Token definition schema
  type Token {
    token: String!
  }
`;

export const tokenMutations = `
  createToken(email: String!, password: String!): Token
`;
