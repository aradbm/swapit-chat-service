import mongoose, { Schema } from "mongoose";
import { IRoom } from "../types/room";

const MessageSchema: Schema = new Schema({
  sender: { type: String, ref: "User", required: true },
  content: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

const RoomSchema: Schema = new Schema({
  participants: [{ type: String, ref: "User", required: true }],
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastMessage: MessageSchema,
});

RoomSchema.index({ participants: 1 });

RoomSchema.pre("save", async function (this: Document & IRoom, next) {
  if (this.isModified("participants") && this.participants.length === 0) {
    // If there are no participants, remove the room
    await (this.constructor as any).deleteOne({ _id: this._id });
    next(new Error("Room deleted due to no participants"));
  } else {
    next();
  }
});

export const RoomModel = mongoose.model<IRoom>("Room", RoomSchema);
