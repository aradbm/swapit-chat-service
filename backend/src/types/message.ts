import { Types } from "mongoose";

export interface IMessage {
  _id?: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  type: string;
  timestamp: Date;
}
