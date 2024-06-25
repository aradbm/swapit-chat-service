import mongoose, { Schema } from "mongoose";
import { IRoom } from "../types/room";

const MessageSchema: Schema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

const RoomSchema: Schema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastMessage: MessageSchema,
});

RoomSchema.index({ participants: 1 });

export const RoomModel = mongoose.model<IRoom>("Room", RoomSchema);
