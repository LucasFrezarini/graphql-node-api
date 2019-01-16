import * as jwt from "jsonwebtoken";

import { JWT_SECRET } from "../../../../src/utils/utils";
import { app, chai, db, expect, handleError } from "../../../test-utils";

describe("Token", () => {
  beforeEach(async () => {
    await db.Comment.destroy({where: {}});
    await db.Post.destroy({where: {}});
    await db.User.destroy({where: {}});

    await db.User.create({
      email: "squirtle@email.com",
      name: "Squirtle",
      password: "123",
    });
  });

  describe("Mutations", () => {
    describe("Application/json", () => {
      describe("createToken", () => {
        it("should return a valid token", async () => {
          const body = {
            query: `
              mutation createNewToken($email: String!, $password: String!){
                createToken(email: $email, password: $password) {
                  token
                }
              }
            `,
            variables: {
              email: "squirtle@email.com",
              password: "123",
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body.data).to.have.key("createToken");
            expect(res.body.data.createToken).to.have.keys(["token"]);
            expect(res.body.data.createToken.token).to.be.an("string");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        it("should return an error if the password is incorrect", async () => {
          const body = {
            query: `
              mutation createNewToken($email: String!, $password: String!){
                createToken(email: $email, password: $password) {
                  token
                }
              }
            `,
            variables: {
              email: "squirtle@email.com",
              password: "124",
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body).to.have.keys(["data", "errors"]);
            // tslint:disable-next-line:no-unused-expression
            expect(res.body.data.createToken).to.be.null;
            expect(res.body.errors).to.be.an("array").with.length(1);
            expect(res.body.errors[0].message).to.be.equals("Incorrect user or password");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        it("should return an error if email doesn't exists", async () => {
          const body = {
            query: `
              mutation createNewToken($email: String!, $password: String!){
                createToken(email: $email, password: $password) {
                  token
                }
              }
            `,
            variables: {
              email: "jigglypuff@email.com",
              password: "123",
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body).to.have.keys(["data", "errors"]);
            // tslint:disable-next-line:no-unused-expression
            expect(res.body.data.createToken).to.be.null;
            expect(res.body.errors).to.be.an("array").with.length(1);
            expect(res.body.errors[0].message).to.be.equals("Incorrect user or password");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });
    });
  });
});
