import { GraphQLFieldResolver } from "graphql";
import { IResolverContext } from "../../interfaces/IResolverContext";
import { ComposableResolver } from "./composable.resolver";

export const AuthResolver: ComposableResolver<any, IResolverContext> =
  (resolver: GraphQLFieldResolver<any, IResolverContext>): GraphQLFieldResolver<any, IResolverContext> =>
    (parent, args, context: IResolverContext, info) => {
      if (context.user || context.authorization) {
        return resolver(parent, args, context, info);
      }

      throw new Error("Unauthorized! Token not provided!");
    }