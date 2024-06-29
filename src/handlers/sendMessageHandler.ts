import { WebSocket } from "ws";
import { RoomModel } from "../models/room";
import { IMessage } from "../types/room"; // Assuming you have this type defined
import { redisPubClient } from "../config/redisSB";

/**
 * When a user sends a message to a room:
 * 1. Update message to mongo
 * 2. Send message to all users update channels inside the room
 * 3. Publish to kafka channel
 */
export async function handleSendMessage(
  ws: WebSocket,
  roomID: string,
  messageType: string,
  messageContent: string,
  userID: string
) {
  try {
    const newMessage: IMessage = {
      sender: userID,
      content: messageContent,
      type: messageType,
      timestamp: new Date(),
    };

    // 1
    const updatedRoom = await RoomModel.findByIdAndUpdate(
      roomID,
      {
        $push: { messages: newMessage },
        $set: { lastMessage: newMessage, updatedAt: new Date() },
      },
      { new: true }
    );
    if (!updatedRoom) {
      throw new Error("Room not found");
    }

    // 2
    for (const participantId of updatedRoom.participants) {
      const userChannel = `user:${participantId}:updates`;
      if (participantId !== userID) {
        await redisPubClient.publish(
          userChannel,
          JSON.stringify({
            type: "roomMessage",
            roomID: roomID,
            message: newMessage,
          })
        );
      }
    }

    // 3
    const kafkaMessage = {
      roomID: roomID,
      message: newMessage,
    };
    await redisPubClient.publish("kafkaChannel", JSON.stringify(kafkaMessage));

    ws.send(JSON.stringify({ type: "messageSent", isSent: true }));
  } catch (error) {
    console.error(error);
    ws.send(
      JSON.stringify({ type: "error", message: "Failed to send message" })
    );
  }
}
