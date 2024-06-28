import { WebSocket } from "ws";
import { UserModel } from "../models/user";
import { redisSubClient } from "../config/redisSB";

/**
 * initialize connection ans subscribe
 * 1. Check if user exist, if not create one in the database
 * 2. Return all the room messages from mongo
 * 3. Subscirbe to user specific updates channel in Redis
 */
export async function handleInitConnection(
  ws: WebSocket,
  photoUrl: string,
  userID: string,
  username: string
) {
  try {
    // Returning rooms for chat main view. Creates a user if does not exist.
    let user = await UserModel.findByUserID(userID);
    if (user) {
      // Update if user changed their username or photo
      user.username = username;
      user.photoUrl = photoUrl;
      await user.save();

      console.log("Found user, returning his open rooms");
      ws.send(JSON.stringify({ type: "corRooms", openRooms: user.openRooms }));
    } else {
      // Create user if not found
      console.log("Creating user, returning empty list");
      user = new UserModel({
        _id: userID,
        userID,
        username,
        photoUrl,
      });
      await user.save();
      ws.send(JSON.stringify({ type: "initRooms", openRooms: [] }));
    }

    redisSubClient.subscribe(`user:${userID}:updates`, (message) => {
      ws.send(JSON.stringify(message));
    });
  } catch (error) {
    console.error(error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to initialize connection",
      })
    );
  }
}
