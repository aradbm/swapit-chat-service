import { Document, Model } from "mongoose";
import { IRoom } from "./room";

export interface IUser extends Document {
  _id: string;
  userID: string;
  username: string;
  photoUrl: string;
  openRooms: IRoom["_id"][];
}

export interface IUserModel extends Model<IUser> {
  findByUserID(userID: string): Promise<IUser | null>;
}
