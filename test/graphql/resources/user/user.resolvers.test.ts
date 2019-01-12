import { app, chai, db, expect, handleError } from "../../../test-utils";

describe("User", () => {

  let userId: number;

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
    });
  });
});
