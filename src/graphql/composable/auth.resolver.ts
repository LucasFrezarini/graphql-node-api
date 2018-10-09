import { GraphQLFieldResolver } from "graphql";
import { IResolverContext } from "../../interfaces/IResolverContext";
import { ComposableResolver } from "./composable.resolver";
import { verfiyTokenResolver } from "./verify-token.resolver";

export const authResolver: ComposableResolver<any, IResolverContext> =
  (resolver: GraphQLFieldResolver<any, IResolverContext>): GraphQLFieldResolver<any, IResolverContext> =>
    (parent, args, context: IResolverContext, info) => {
      if (context.authUser || context.authorization) {
        return resolver(parent, args, context, info);
      }

      throw new Error("Unauthorized! Token not provided!");
    };

export const authResolvers = [authResolver, verfiyTokenResolver];
