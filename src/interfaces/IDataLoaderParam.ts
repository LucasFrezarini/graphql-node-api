import { GraphQLResolveInfo } from "graphql";

export interface IDataLoaderParam<T> {
  key: T;
  info: GraphQLResolveInfo;
}
