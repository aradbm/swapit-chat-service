import { WebSocket } from "ws";
import { UserModel } from "../models/user";
import { redisSubClient } from "../config/redisSB";
import { RoomModel } from "../models/room";

/**
 * initialize connection ans subscribe
 * 1. Check if user exist, if not create one in the database
 * 2. Return all the rooms for the user and send them to the client without the messages
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
    }
    // search in the rooms collection all the rooms that the user is in, and return them without the
    const userOpenRoomsIDs = user.openRooms;

    // For each open room id, return the room without the messages
    const userOpenRooms = await Promise.all(
      userOpenRoomsIDs.map(async (roomID) => {
        const room = await RoomModel.findById(roomID)
          .select("-messages")
          .lean();
        return room;
      })
    );

    ws.send(JSON.stringify({ type: "initRooms", openRooms: userOpenRooms }));

    redisSubClient.subscribe(`user:${userID}:updates`, (message) => {
      ws.send(message);
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
