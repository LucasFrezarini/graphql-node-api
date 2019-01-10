import * as DataLoader from "dataloader";

import { IDataLoaders } from "../../interfaces/IDataLoaders";
import { IDbConnection } from "../../interfaces/IDbConnection";
import { IPostInstance } from "../../models/PostModel";
import { IUserInstance } from "../../models/UserModel";
import { PostLoader } from "./PostLoader";
import { UserLoader } from "./UserLoader";

export class DataLoaderFactory {
  constructor(
    private db: IDbConnection,
  ) {}

  public getLoaders(): IDataLoaders {
    return {
      postLoader: new DataLoader<number, IPostInstance>(
        (ids: number[]) => PostLoader.batchPosts(this.db.Post, ids),
      ),
      userLoader: new DataLoader<number, IUserInstance>(
        (ids: number[]) => UserLoader.batchUsers(this.db.User, ids),
      ),
    };
  }
}
