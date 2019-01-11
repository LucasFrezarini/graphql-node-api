import { IDataLoaderParam } from "../../interfaces/IDataLoaderParam";
import { IUserInstance, IUserModel } from "../../models/UserModel";
import { RequestedFields } from "../ast/RequestedFields";

export class UserLoader {
  public static batchUsers(
    User: IUserModel,
    params: Array<IDataLoaderParam<number>>,
    requestedFields: RequestedFields): Promise<IUserInstance[]> {
      const ids = params.map((param) => param.key);
      const info = params[0].info;

      return Promise.resolve(
        User.findAll({
          attributes: requestedFields.getFields(info, {keep: ["id"], exclude: ["posts"]}),
          where: {
            id: { $in: ids },
          },
        }),
      );
    }
}
