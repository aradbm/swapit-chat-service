import test from "./testDB";
import { connectToMongoDB } from "./config/mongoDB";
import { connectToRedisPubSub } from "./config/redisSB";
import { WebSocketServer } from "ws";
import startWebSocketServer from "./config/wsServer";

const PORT: number = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });

const startServer = async () => {
  try {
    await connectToMongoDB();
    await connectToRedisPubSub();
    test().then((result) => {
      if (!result) throw new Error("Test failed");
    });
    console.log("Successfuly tested connection to redis and mongo");

    startWebSocketServer(wss);
    console.log(`WebSocket server started on port ${PORT}`);
  } catch (error) {
    console.error("------------Error starting server------------\n", error);
    
    process.exit(1);
  }
};

startServer();
