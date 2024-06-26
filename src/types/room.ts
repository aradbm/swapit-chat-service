import { Document, Types } from "mongoose";
import { IMessage } from "./roomMessage";

export interface IRoom extends Document<string> {
  participants: Types.Array<string>;
  messages: Types.Array<IMessage>;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: IMessage;
}

export { IMessage };
