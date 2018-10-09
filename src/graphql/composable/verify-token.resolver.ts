import { GraphQLFieldResolver } from "graphql";
import * as jwt from "jsonwebtoken";
import { IResolverContext } from "../../interfaces/IResolverContext";
import { JWT_SECRET } from "../../utils/utils";
import { ComposableResolver } from "./composable.resolver";

export const verfiyTokenResolver: ComposableResolver<any, IResolverContext> =
  (resolver: GraphQLFieldResolver<any, IResolverContext>): GraphQLFieldResolver<any, IResolverContext> =>
    (parent, args, context: IResolverContext, info) =>
    jwt.verify(context.authorization, JWT_SECRET, (err, decoded: any) => {
      if (!err) {
        return resolver(parent, args, context, info);
      }

      throw new Error(`${err.name}: ${err.message}`);
    });
