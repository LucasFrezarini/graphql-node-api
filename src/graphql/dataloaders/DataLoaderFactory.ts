import * as DataLoader from "dataloader";

import { IDataLoaderParam } from "../../interfaces/IDataLoaderParam";
import { IDataLoaders } from "../../interfaces/IDataLoaders";
import { IDbConnection } from "../../interfaces/IDbConnection";
import { IPostInstance } from "../../models/PostModel";
import { IUserInstance } from "../../models/UserModel";
import { RequestedFields } from "../ast/RequestedFields";
import { PostLoader } from "./PostLoader";
import { UserLoader } from "./UserLoader";

export class DataLoaderFactory {
  constructor(
    private db: IDbConnection,
    private requestedFields: RequestedFields,
  ) {}

  public getLoaders(): IDataLoaders {
    return {
      postLoader: new DataLoader<IDataLoaderParam<number>, IPostInstance>(
        (params: Array<IDataLoaderParam<number>>) => PostLoader.batchPosts(this.db.Post, params, this.requestedFields),
        { cacheKeyFn: (param: IDataLoaderParam<number[]>) => param.key },
      ),
      userLoader: new DataLoader<IDataLoaderParam<number>, IUserInstance>(
        (params: Array<IDataLoaderParam<number>>) => UserLoader.batchUsers(this.db.User, params, this.requestedFields),
        { cacheKeyFn: (param: IDataLoaderParam<number[]>) => param.key },
      ),
    };
  }
}
