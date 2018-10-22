import * as DataLoader from "dataloader";
import { IPostAttributes } from "../models/PostModel";
import { IUserInstance } from "../models/UserModel";

export interface IDataLoaders {
    userLoader: DataLoader<number, IUserInstance>;
    postLoader: DataLoader<number, IPostAttributes>;
}
