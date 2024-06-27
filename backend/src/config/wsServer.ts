import { WebSocketServer, WebSocket } from "ws";
import { Message, WebSocketError } from "../types/wsMessage";
import { handleJoinRoom } from "../handlers/joinRoomHandler";
import { handleLeaveRoom } from "../handlers/leaveRoomHandler";
import { handleInitConnection } from "../handlers/initConnHandler";
import { handleSendMessage } from "../handlers/sendMessageHandler";
import { handleCreateRoom } from "../handlers/createRoomHandler";
import { redisSubClient } from "./redisSB";

const startWebSocketServer = (wss: WebSocketServer): void => {
  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");
    let userId: string | undefined;
    let correntRoomId: string | undefined;

    ws.on("message", async (message: string) => {
      try {
        const data = JSON.parse(message) as Message;
        console.log(`Received message of type ${data.type}: `, data);

        switch (data.type) {
          case "init":
            await handleInitConnection(
              ws,
              data.photoUrl,
              data.userID,
              data.username
            );
            userId = data.userID;
            break;
          case "joinRoom":
            await handleJoinRoom(ws, data.roomID, data.userID);
            correntRoomId = data.roomID;
            break;
          case "leaveRoom":
            await handleLeaveRoom(ws, data.roomID, data.userID);
            correntRoomId = undefined;
            break;
          case "sendMessage":
            await handleSendMessage(
              ws,
              data.roomID,
              data.messageType,
              data.message,
              data.userID
            );
            break;
          case "createRoom":
            await handleCreateRoom(
              ws,
              data.participants,
              data.userID,
              data.username
            );
          default:
            console.log(`Invalid message type: ${data.type}`);
          // throw new WebSocketError("Invalid message type");
        }
      } catch (error) {
        console.error("Error processing message:", error);
        if (error instanceof WebSocketError) {
          ws.send(JSON.stringify({ type: "error", message: error.message }));
        } else if (error instanceof SyntaxError) {
          ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        } else {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "An unexpected error occurred",
            })
          );
        }
      }
    });

    ws.on("error", (error: Error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", async () => {
      if (userId) {
        const userChannel = `user:${userId}:updates`;
        await redisSubClient.unsubscribe(userChannel);
      }
      if (correntRoomId) {
        const roomChannel = `room:${correntRoomId}`;
        await redisSubClient.unsubscribe(roomChannel);
      }
      console.log("Client disconnected");
    });
  });

  wss.on("error", (error: Error) => {
    console.error("WebSocket server error:", error);
  });
};

export default startWebSocketServer;
