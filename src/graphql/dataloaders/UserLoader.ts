import { IUserInstance, IUserModel } from "../../models/UserModel";

export class UserLoader {
  public static batchUsers(User: IUserModel, ids: number[]): Promise<IUserInstance[]> {
    return Promise.resolve(User.findAll({
      where: {
        id: { $in: ids },
      },
    }));
  }
}
