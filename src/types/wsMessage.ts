// Incoming message types for WebSocket connections
type WSMessageType =
  | "init"
  | "joinRoom"
  | "leaveRoom"
  | "sendMessage"
  | "createRoom";

interface BaseMessage {
  type: WSMessageType;
  userID: string;
}

/* When a new WebSocket connection is established, the client sends an init message to the server
 * to identify the user. The server then creates a new ChatUser document in the database if one
 * doesn't already exist.
 */
interface InitMessage extends BaseMessage {
  type: "init";
  username: string;
  photoUrl: string;
}

/* When a user joins or leaves a room, the client sends a room message to the server with the roomID
 * and the type of action (joinRoom or leaveRoom).
 */
interface RoomMessage extends BaseMessage {
  type: "joinRoom" | "leaveRoom";
  roomID: string;
}

interface CreateRoomMessage extends BaseMessage {
  type: "createRoom";
  participants: string[];
  username: string;
}

/* When a user sends a message in a room, the client sends a sendMessage message to the server with
 * the message content.
 */
interface SendMessageMessage extends BaseMessage {
  type: "sendMessage";
  messageType: string;
  message: string;
  roomID: string;
}

type Message =
  | InitMessage
  | RoomMessage
  | SendMessageMessage
  | CreateRoomMessage;

class WebSocketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebSocketError";
  }
}

export { Message, WebSocketError };
