import { IPostInstance, IPostModel } from "../../models/PostModel";

export class PostLoader {
  public static batchPosts(Post: IPostModel, ids: number[]): Promise<IPostInstance[]> {
    return Promise.resolve(
      Post.findAll({
        where: {
          id: { $in: ids },
        },
      }),
    );
  }
}
