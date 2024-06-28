import { WebSocket } from "ws";
import { RoomModel } from "../models/room";

/**
 * When user leave a room (indefenetly, not disconnect from live updates)
 */
export async function handleLeaveRoom(
  ws: WebSocket,
  roomID: string,
  userID: string
) {
  try {
    await RoomModel.findByIdAndUpdate(roomID, {
      $pull: { participants: userID },
    });

    ws.send(JSON.stringify({ type: "leftRoom", roomID }));
  } catch (error) {
    console.error("Error in handleLeaveRoom:", error);
    ws.send(JSON.stringify({ type: "error", message: "Failed to leave room" }));
  }
}
