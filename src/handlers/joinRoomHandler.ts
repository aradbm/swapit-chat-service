import { WebSocket } from "ws";
import { RoomModel } from "../models/room";
import { redisSubClient } from "../config/redisSB";
/**
 * When user gets in a specific room
 * 1. Return all the room messages from mongo
 * 2. Subscirbe to room updates in Redis
 */
export async function handleJoinRoom(
  ws: WebSocket,
  roomID: string,
  userID: string
) {
  try {
    // Find room by room id in the collection
    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error("Room not found");
    }
    // check to see if the user is inside the room, if not add him and update mongo
    if (!room.participants.includes(userID)) {
      room.participants.push(userID);
      await room.save();
    }
    console.log("added user to room");

    // Subscribe user to room's Redis channel
    const roomChannel = `room:${roomID}`;
    await redisSubClient.subscribe(roomChannel, (message) => {
      ws.send(message);
    });
    console.log("Successfully subscribed to room channel");

    // Send whole room back
    ws.send(JSON.stringify({ type: "updatedRoom", updatedRoom: room }));
    console.log("sent room history");
  } catch (error) {
    console.error("Error in handleJoinRoom:", error);
    ws.send(JSON.stringify({ type: "error", message: "Failed to join room" }));
  }
}
