import { IDataLoaderParam } from "../../interfaces/IDataLoaderParam";
import { IPostInstance, IPostModel } from "../../models/PostModel";
import { RequestedFields } from "../ast/RequestedFields";

export class PostLoader {
  public static batchPosts(
    Post: IPostModel,
    params: Array<IDataLoaderParam<number>>,
    requestedFields: RequestedFields): Promise<IPostInstance[]> {
      const ids = params.map((param) => param.key);
      const info = params[0].info;

      return Promise.resolve(
        Post.findAll({
          attributes: requestedFields.getFields(info, {keep: ["id"], exclude: ["comments"]}),
          where: {
            id: { $in: ids },
          },
        }),
      );
  }
}
