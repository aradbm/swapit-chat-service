import { WebSocket } from "ws";
import { RoomModel } from "../models/room";
import { redisSubClient, redisPubClient } from "../config/redisSB";
import { IRoom } from "../types/room";
import { UserModel } from "../models/user";

/**
 * When user creates a room
 * 1. Create a new room in mongo
 * 2. Update all participants open rooms in mongo
 * 3. Subscribe user to said room
 * 4. Update all participants that a user has joined in Redis
 */
export async function handleCreateRoom(
  ws: WebSocket,
  participants: string[],
  userID: string,
  username: string
) {
  try {
    // 1
    const newRoom: IRoom = new RoomModel({
      participants: [...participants, userID],
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedRoom = await newRoom.save();

    // 2
    for (const participantId of newRoom.participants) {
      const participant = await UserModel.findByUserID(participantId);
      if (participant) {
        participant.openRooms.push(savedRoom._id);
        await participant.save();
      }
    }
    console.log(`Updated all participants open rooms`);

    // 3
    console.log(`Subscribing to room ${savedRoom._id}`);
    const roomId = (savedRoom._id as string).toString();
    await redisSubClient.subscribe(`room:${roomId}`, (message) => {
      ws.send(message);
    });
    console.log(`Subscribed to room ${savedRoom._id}`);

    // 4
    console.log(`Notifying all participants about new room`);
    for (const participantId of participants) {
      if (participantId !== userID) {
        console.log(`Notifying user ${participantId} about new room`);
        const userChannel = `user:${participantId}:updates`;
        await redisPubClient.publish(
          userChannel,
          JSON.stringify({
            type: "newRoom",
            createdByUser: username,
            room: savedRoom,
          })
        );
      }
    }
    console.log(`Notified all participants about new room`);

    // Respond to creating user with the new room
    ws.send(JSON.stringify({ type: "createdRoom", roomId: roomId }));
  } catch (error) {
    console.error("Error in handleCreateRoom:", error);
    ws.send(
      JSON.stringify({ type: "error", message: "Failed to create room" })
    );
  }
}
