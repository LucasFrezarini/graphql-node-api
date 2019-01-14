import * as jwt from "jsonwebtoken";

import { JWT_SECRET } from "../../../../src/utils/utils";
import { app, chai, db, expect, handleError } from "../../../test-utils";

describe("Post", () => {

  let userId: number;
  let token: string;
  let postId: number;

  beforeEach(async () => {
    await db.Comment.destroy({where: {}});
    await db.Post.destroy({where: {}});
    await db.User.destroy({where: {}});

    const user = await db.User.create({
      email: "squirtle@email.com",
      name: "Squirtle",
      password: "123",
    });

    userId = user.get("id");
    token = jwt.sign({sub: userId}, JWT_SECRET);

    const posts = await db.Post.bulkCreate([
      {
        author: userId,
        content: "First Post",
        photo: "some_photo",
        title: "First Post",
      },
      {
        author: userId,
        content: "Second Post",
        photo: "some_photo",
        title: "Second Post",
      },
      {
        author: userId,
        content: "Third Post",
        photo: "some_photo",
        title: "Third Post",
      },
    ]);

    postId = posts[0].get("id");
  });

  describe("Queries", () => {
    describe("Application/json", () => {
      describe("posts", async () => {
        it("should return a list of posts", async () => {
          const body = {
            query: `
              query {
                posts {
                  title
                  content
                  photo
                }
              }
            `,
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);

            const posts = res.body.data.posts;
            expect(res.body.data).to.be.an("object");
            expect(posts).to.be.an("array").of.length(3);
            expect(posts[0]).to.has.keys(["title", "content", "photo"]);
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("post", () => {
        it("should return a single post with his author", async () => {
          const body = {
            query: `
              query getPostById($id: ID!){
                post(id: $id){
                  title
                  content
                  author {
                    name
                  }
                  comments {
                    comment
                  }
                }
              }
            `,
            variables: {
              id: postId,
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body.data).to.be.an("object").with.key("post");

            const post = res.body.data.post;
            expect(post).to.has.keys(["title", "content", "author", "comments"]);
            expect(post.title).to.be.equals("First Post");
            expect(post.author).to.has.key("name");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });
    });

    describe("Application/graphql", () => {
      describe("posts", () => {
        it("should return a list of posts", async () => {
          const body = `
            query {
              posts {
                title
                content
                photo
              }
            }
          `;

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/graphql")
              .send((body));

            expect(res.status).to.be.equals(200);

            const posts = res.body.data.posts;
            expect(res.body.data).to.be.an("object");
            expect(posts).to.be.an("array").of.length(3);
            expect(posts[0]).to.has.keys(["title", "content", "photo"]);
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        it("should return a paginated list of posts", async () => {
          const body = `
            query getPostsList($first: Int, $offset: Int) {
              posts(first: $first, offset: $offset) {
                title
                content
                photo
              }
            }
          `;

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/graphql")
              .query({
                variables: JSON.stringify({
                  first: 2,
                  offset: 1,
                }),
              })
              .send((body));

            expect(res.status).to.be.equals(200);

            const posts = res.body.data.posts;
            expect(res.body.data).to.be.an("object");
            expect(posts).to.be.an("array").of.length(2);
            expect(posts[0]).to.has.keys(["title", "content", "photo"]);
            expect(posts[0].title).to.be.equal("Second Post");
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
      describe("createPost", () => {
        it("should create a new post", async () => {
          const body = {
            query: `
              mutation createNewPost($input: PostInput!){
                createPost(input: $input){
                  title
                  content
                  author {
                    id
                  }
                }
              }
            `,
            variables: {
              input: {
                content: "Fourth Post",
                photo: "some_photo",
                title: "Fourth Post",
              },
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .set("Authorization", `Bearer ${token}`)
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body.data).to.be.an("object").with.key("createPost");

            const createdPost = res.body.data.createPost;
            expect(createdPost).to.has.keys(["title", "content", "author"]);
            expect(createdPost.title).to.be.equals("Fourth Post");
            expect(createdPost.content).to.be.equals("Fourth Post");
            expect(parseInt(createdPost.author.id, 10)).to.be.equals(userId);
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("updatePost", () => {
        it("should update an existing post", async () => {
          const body = {
            query: `
              mutation updateExistingPost($id: ID!, $input: PostInput!){
                updatePost(id: $id, input: $input){
                  id
                  title
                  content
                  updatedAt
                }
              }
            `,
            variables: {
              id: postId,
              input: {
                content: "Updated Post",
                photo: "some_photo_2",
                title: "Updated Post",
              },
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .set("Authorization", `Bearer ${token}`)
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);
            expect(res.body.data).to.be.an("object").with.key("updatePost");

            const updatedPost = res.body.data.updatePost;
            expect(updatedPost).to.has.keys(["title", "content", "updatedAt", "id"]);
            expect(updatedPost.title).to.be.equals("Updated Post");
            expect(updatedPost.content).to.be.equals("Updated Post");
          } catch (err) {
            handleError(err);
            throw err;
          }
        });

        describe("deletePost", () => {
          it("should delete an existing post", async () => {
            const body = {
              query: `
                mutation deleteExistingPost($id: ID!){
                  deletePost(id: $id)
                }
              `,
              variables: {
                id: postId,
              },
            };

            try {
              const res = await chai.request(app)
                .post("/graphql")
                .set("Content-Type", "application/json")
                .set("Authorization", `Bearer ${token}`)
                .send(JSON.stringify(body));

              expect(res.status).to.be.equals(200);
              // tslint:disable-next-line:no-unused-expression
              expect(res.body.data.deletePost).to.be.true;
            } catch (err) {
              handleError(err);
              throw err;
            }
          });
        });
      });
    });
  });
});
