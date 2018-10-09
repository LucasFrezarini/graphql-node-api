import { NextFunction, Request, RequestHandler, Response } from "express";
import * as jwt from "jsonwebtoken";
import db from "../models";
import { JWT_SECRET } from "../utils/utils";

export const extreactJwtMiddleware = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authorization = req.get("authorization");
    const token = authorization ? authorization.split(" ")[1] : undefined;

    // tslint:disable:no-string-literal
    req["context"] = {};
    req["context"]["authorization"] = token;

    if (!token) { return next(); }

    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err) { return next(); }

      try {
        const user = await db.User.findById(decoded.sub, {
          attributes: ["id", "email"],
        });

        if (user) {
          req["context"]["authUser"] = {
            email: user.get("email"),
            id: user.get("id"),
          };
        }

        return next();
      } catch (err) {
        return next(err);
      }
    });
  };
};
