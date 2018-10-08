import * as jwt from "jsonwebtoken";
import { IDbConnection } from "../../../interfaces/IDbConnection";
import { JWT_SECRET } from "../../../utils/utils";

export const tokenResolvers = {
  Mutation: {
    createToken: async (parent, { email, password }, { db }: { db: IDbConnection }) => {
      const user = await db.User.findOne({
        attributes: ["id", "password"],
        where: { email },
      });

      if (!user || !user.isPassword(user.get("password"), password)) {
        throw new Error("Incorrect user or password");
      }

      const payload = { sub: user.get("id") };

      return new Promise((resolve, reject) => jwt.sign(payload, JWT_SECRET, (err, token) => {
        if (err) { return reject(err); }

        return resolve({token});
      }));
    },
  },
};
