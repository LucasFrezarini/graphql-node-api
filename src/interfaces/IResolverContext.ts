import { IAuthUser } from "./IAuthUser";
import { IDataLoaders } from "./IDataLoaders";
import { IDbConnection } from "./IDbConnection";

export interface IResolverContext {
  db?: IDbConnection;
  authorization?: string;
  authUser: IAuthUser;
  dataLoaders: IDataLoaders;
}
