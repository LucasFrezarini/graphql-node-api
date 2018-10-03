import { ICommentModel } from "../models/CommentModel";
import { IPostModel } from "../models/PostModel";
import { IUserModel } from "../models/UserModel";

export interface IModels {
  Comment: ICommentModel;
  Post: IPostModel;
  User: IUserModel;
}
