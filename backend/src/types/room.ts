import { Document, Types } from "mongoose";
import { IMessage } from "./message";

export interface IRoom extends Document {
  participants: Types.Array<Types.ObjectId>;
  messages: Types.Array<IMessage>;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: IMessage;
}
