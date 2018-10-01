import { makeExecutableSchema } from "graphql-tools";

const users: object[] = [
  {
    email: "lucas.frezarini@gmail.com",
    id: 1,
    name: "Lucas",
  },
  {
    email: "Pocoyo@poco.com",
    id: 2,
    name: "Pocoyo",
  },
  {
    email: "porco@rodorfo.com",
    id: 3,
    name: "Rodorfo",
  },
];

const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    allUsers: [User!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
  }
`;

const resolvers = {
  Mutation: {
    createUser: (parent, args) => {
      const newUser = Object.assign({id: users.length + 1}, args);
      users.push(newUser);
      return newUser;
    },
  },
  Query: {
    allUsers: () => users,
  },
};

export default makeExecutableSchema({typeDefs, resolvers});
