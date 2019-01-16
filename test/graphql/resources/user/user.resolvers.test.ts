import * as jwt from "jsonwebtoken";

import { JWT_SECRET } from "../../../../src/utils/utils";
import { app, chai, db, expect, handleError } from "../../../test-utils";

describe("User", () => {

  let userId: number;
  let token: string;

  beforeEach(async () => {
    await db.Comment.destroy({where: {}});
    await db.Post.destroy({where: {}});
    await db.User.destroy({where: {}});

    const users = await db.User.bulkCreate([
      {
        email: "squirtle@email.com",
        name: "Squirtle",
        password: "123",
      },
      {
        email: "charmander@email.com",
        name: "charmander",
        password: "456",
      },
      {
        email: "bulbasaur@email.com",
        name: "Bulbasaur",
        password: "789",
      },
    ]);

    userId = users[0].get("id");
    token = jwt.sign({sub: userId}, JWT_SECRET);
  });

  describe("Queries", () => {
    describe("Application/json", () => {
      describe("users", () => {
        it("should return a list of users", async () => {
          const body = {
            query: `
              query {
                users {
                  name
                  email
                }
              }
            `,
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            const users = res.body.data.users;

            expect(res.body.data).to.be.an("object");
            expect(users).to.be.an("array").of.length(3);
            expect(users[0]).to.has.keys(["name", "email"]);
            expect(users[0]).to.not.has.keys(["id", "password", "createdAt", "updatedAt"]);
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        it("should paginate a list of users", async () => {
          const body = {
            query: `
              query getListOfUsers($first: Int, $offset: Int){
                users(first: $first, offset: $offset) {
                  name
                  createdAt
                }
              }
            `,
            variables: {
              first: 2,
              offset: 1,
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            const users = res.body.data.users;

            expect(res.body.data).to.be.an("object");
            expect(users).to.be.an("array").of.length(2);
            expect(users[0]).to.has.keys(["name", "createdAt"]);
            expect(users[0]).to.not.has.keys(["id", "password", "email", "updatedAt"]);
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("user", () => {
        it("should return a single user", async () => {
          const body = {
            query: `
              query getSingleUser($id: ID!){
                user(id: $id) {
                  id
                  name
                  email
                  posts {
                    title
                  }
                }
              }
            `,
            variables: {
              id: userId,
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);

            const user = res.body.data.user;

            expect(res.body.data).to.be.an("object");
            expect(user).to.be.an("object");
            expect(user).to.has.keys(["name", "email", "posts", "id"]);
            expect(parseInt(user.id, 10)).to.be.equals(userId);
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        it("should return only the name of user", async () => {
          const body = {
            query: `
              query getSingleUser($id: ID!){
                user(id: $id) {
                  name
                }
              }
            `,
            variables: {
              id: userId,
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);

            const user = res.body.data.user;

            expect(res.body.data).to.be.an("object");
            expect(user).to.be.an("object");
            expect(user).to.has.keys(["name"]);
            expect(user.name).to.be.equals("Squirtle");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        it("should return an error if userId doesn't exists", async () => {
          const body = {
            query: `
              query getSingleUser($id: ID!){
                user(id: $id) {
                  name
                  email
                }
              }
            `,
            variables: {
              id: -1,
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);

            expect(res.body).to.has.keys(["data", "errors"]);
            expect(res.body.errors).to.be.an("array").of.length(1);
            // tslint:disable-next-line:no-unused-expression
            expect(res.body.data.user).to.be.null;
            expect(res.body.errors[0].message).to.be.equals("Error: User with id -1 not found!");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("currentUser", () => {
        it("should return the user infos of the token owner", async () => {
          const body = {
            query: `
              query {
                currentUser {
                  name
                  email
                }
              }
            `,
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .set("Authorization", `Bearer ${token}`)
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            const user = res.body.data.currentUser;

            expect(res.body.data).to.be.an("object");
            expect(user).to.be.an("object");
            expect(user).to.has.keys(["name", "email"]);
            expect(user.name).to.be.equals("Squirtle");
            expect(user.email).to.be.equals("squirtle@email.com");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        it("should return an error if the token owner is invalid", async () => {
          const body = {
            query: `
              query {
                currentUser {
                  name
                  email
                }
              }
            `,
          };

          const invalidToken = jwt.sign({sub: -1}, JWT_SECRET);
          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .set("Authorization", `Bearer ${invalidToken}`)
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body).to.has.keys(["data", "errors"]);
            expect(res.body.errors).to.be.an("array").of.length(1);

            // tslint:disable-next-line:no-unused-expression
            expect(res.body.data.currentUser).to.be.null;
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });
    });
  });

  describe("Mutations", () => {
    describe("Application/json", () => {
      describe("createUser", () => {
        it("should create a new user", async () => {
          const body = {
            query: `
              mutation createNewUser($input: UserCreateInput!){
                createUser(input: $input) {
                  id
                  name
                  email
                }
              }
            `,
            variables: {
              input: {
                email: "pikachu@email.com",
                name: "Pikachu",
                password: "123",
              },
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body.data).to.be.an("object");

            const createdUser = res.body.data.createUser;
            expect(createdUser).to.has.keys(["id", "name", "email"]);
            expect(parseInt(createdUser.id, 10)).to.be.an("number");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("updateUser", () => {
        it("should update an existing user", async () => {
          const body = {
            query: `
              mutation updateExistingUser($input: UserUpdateInput!){
                updateUser(input: $input) {
                  name
                  email
                  updatedAt
                }
              }
            `,
            variables: {
              input: {
                email: "wartortle@email.com",
                name: "Wartortle",
                photo: "some_photo",
              },
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Authorization", `Bearer ${token}`)
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body.data).to.be.an("object");

            const updatedUser = res.body.data.updateUser;
            expect(updatedUser).to.has.keys(["name", "email", "updatedAt"]);
            expect(updatedUser.name).to.be.equals("Wartortle");
            expect(updatedUser.email).to.be.equals("wartortle@email.com");
            // tslint:disable-next-line:no-unused-expression
            expect(updatedUser.id).to.be.undefined;
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        it("should not update the user if the token is invalid", async () => {
          const body = {
            query: `
              mutation updateExistingUser($input: UserUpdateInput!){
                updateUser(input: $input) {
                  name
                  email
                  updatedAt
                }
              }
            `,
            variables: {
              input: {
                email: "wartortle@email.com",
                name: "Wartortle",
                photo: "some_photo",
              },
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Authorization", "Bearer INVALID_TOKEN")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.has.keys(["data", "errors"]);
            expect(res.body.errors).to.be.an("array").of.length(1);
            expect(res.body.errors[0].message).to.be.equals("JsonWebTokenError: jwt malformed");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("updateUserPassword", () => {
        it("should update the password of an existing user", async () => {
          const body = {
            query: `
              mutation updateExistingUserPassword($input: UserUpdatePasswordInput!){
                updateUserPassword(input: $input)
              }
            `,
            variables: {
              input: {
                password: "changed",
              },
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Authorization", `Bearer ${token}`)
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body.data).to.be.an("object");
            // tslint:disable-next-line:no-unused-expression
            expect(res.body.data.updateUserPassword).to.be.true;
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("deleteUser", () => {
        it("should delete an existing user", async () => {
          const body = {
            query: `
              mutation {
                deleteUser
              }
            `,
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Authorization", `Bearer ${token}`)
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body.data).to.be.an("object");
            // tslint:disable-next-line:no-unused-expression
            expect(res.body.data.deleteUser).to.be.true;
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });
    });
  });
});
