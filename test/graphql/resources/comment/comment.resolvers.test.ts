import * as jwt from "jsonwebtoken";

import { JWT_SECRET } from "../../../../src/utils/utils";
import { app, chai, db, expect, handleError } from "../../../test-utils";

describe("Comment", () => {
  let userId: number;
  let token: string;
  let postId: number;
  let commentId: number;

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

    const post = await db.Post.create({
        author: userId,
        content: "First Post",
        photo: "some_photo",
        title: "First Post",
    });

    postId = post.get("id");

    const comments = await db.Comment.bulkCreate([
      {
        comment: "First Comment",
        post: postId,
        user: userId,
      },
      {
        comment: "Second Comment",
        post: postId,
        user: userId,
      },
      {
        comment: "Third Comment",
        post: postId,
        user: userId,
      },
    ]);

    commentId = comments[0].get("id");
  });

  describe("Queries", () => {
    describe("Application/json", () => {
      describe("commentsByPost", () => {
        it("should return a paginated list of comments", async () => {
          const body = {
            query: `
              query getCommentsByPostList($postId: ID!, $first: Int, $offset: Int){
                commentsByPost(postId: $postId, first: $first, offset: $offset) {
                  comment
                  user {
                    id
                  }
                  post {
                    id
                  }
                }
              }
            `,
            variables: {
              first: 2,
              offset: 1,
              postId,
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);

            const comments = res.body.data.commentsByPost;
            expect(res.body.data).to.be.an("object");
            expect(comments).to.be.an("array").of.length(2);
            expect(comments[0]).to.has.keys(["comment", "user", "post"]);
            expect(comments[0].comment).to.be.equals("Second Comment");
            expect(parseInt(comments[0].user.id, 10)).to.be.equals(userId);
            expect(parseInt(comments[0].post.id, 10)).to.be.equals(postId);
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
      describe("createComment", () => {
        it("should create a new comment", async () => {
          const body = {
            query: `
              mutation createNewComment($input: CommentInput!){
                createComment(input: $input) {
                  comment
                  user {
                    id
                    name
                  }
                  post {
                    id
                    title
                  }
                }
              }
            `,
            variables: {
              input: {
                comment: "Fourth Comment",
                post: postId,
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

            expect(res.body.data).to.be.an("object");
            expect(res.body.data.createComment).to.be.an("object");

            const createdComment = res.body.data.createComment;

            expect(createdComment).to.has.keys(["comment", "user", "post"]);
            expect(createdComment.comment).to.be.equals("Fourth Comment");
            expect(parseInt(createdComment.user.id, 10)).to.be.equals(userId);
            expect(createdComment.user.name).to.be.equals("Squirtle");
            expect(parseInt(createdComment.post.id, 10)).to.be.equals(postId);
            expect(createdComment.post.title).to.be.equals("First Post");

          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("updateComment", () => {
        it("should update an existing comment", async () => {
          const body = {
            query: `
              mutation updateExistingComment($id: ID!, $input: CommentInput!){
                updateComment(id: $id, input: $input) {
                  id
                  comment
                }
              }
            `,
            variables: {
              id: commentId,
              input: {
                comment: "Updated Comment",
                post: postId,
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

            expect(res.body.data).to.be.an("object");
            expect(res.body.data.updateComment).to.be.an("object");

            const updatedComment = res.body.data.updateComment;

            expect(updatedComment).to.has.keys(["comment", "id"]);
            expect(updatedComment.comment).to.be.equals("Updated Comment");
            expect(parseInt(updatedComment.id, 10)).to.be.equals(commentId);

          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });

      describe("deleteComment", () => {
        it("should delete an existing comment", async () => {
          const body = {
            query: `
              mutation deleteExistingComment($id: ID!){
                deleteComment(id: $id)
              }
            `,
            variables: {
              id: commentId,
            },
          };

          try {
            const res = await chai.request(app)
              .post("/graphql")
              .set("Content-Type", "application/json")
              .set("Authorization", `Bearer ${token}`)
              .send(JSON.stringify(body));

            expect(res.status).to.be.equals(200);

            expect(res.body.data).to.be.an("object");
            // tslint:disable-next-line:no-unused-expression
            expect(res.body.data.deleteComment).to.be.true;
          } catch (err) {
            handleError(err);
            throw err;
          }
        });
      });
    });
  });
});
