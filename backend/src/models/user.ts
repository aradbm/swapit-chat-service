import mongoose, { Schema } from "mongoose";
import { IUser, IUserModel } from "../types/user";

const UserSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      description: "Unique identifier for the user, same as userID",
    },
    userID: {
      type: String,
      required: true,
      unique: true,
      description: "User ID provided by firebase auth when user signs up",
    },
    username: {
      type: String,
      required: true,
      description: "User's username",
    },
    photoUrl: {
      type: String,
      default: "default-photo-url.jpg",
      description: "URL of user's profile photo",
    },
    openRooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room",
        description: "List of user's open rooms",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure userID and _id are always the same
UserSchema.pre("save", function (next) {
  if (this.isNew) {
    this._id = this.userID;
  }
  next();
});

// Static method to find a user by their userID
UserSchema.statics.findByUserID = function (userID: string) {
  return this.findOne({ userID });
};

export const UserModel = mongoose.model<IUser, IUserModel>("User", UserSchema);
