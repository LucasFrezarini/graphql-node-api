import { IAuthUser } from "./IAuthUser";
import { IDbConnection } from "./IDbConnection";

export interface IResolverContext {
  db?: IDbConnection;
  authorization?: string;
  user: IAuthUser;
}
