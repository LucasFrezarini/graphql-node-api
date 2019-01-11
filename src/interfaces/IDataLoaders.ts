import * as DataLoader from "dataloader";
import { IPostAttributes } from "../models/PostModel";
import { IUserInstance } from "../models/UserModel";
import { IDataLoaderParam } from "./IDataLoaderParam";

export interface IDataLoaders {
    userLoader: DataLoader<IDataLoaderParam<number>, IUserInstance>;
    postLoader: DataLoader<IDataLoaderParam<number>, IPostAttributes>;
}
