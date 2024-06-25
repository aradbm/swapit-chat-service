import { connectToMongoDB } from "./config/mongoDB";
import { Express } from "express";
import { initializeRedis } from "./config/redisSB";
import test from "./testDB";
import express from "express";
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
import WebSocket from "ws";

// const wss = new WebSocket.Server({ port: 8080 });

// wss.on("connection", (ws: WebSocket) => {
//   console.log("New client connected");

//   ws.on("message", (message: string) => {
//     console.log(`Received message: ${message}`);
//     ws.send(`Server received your message: ${message}`);
//   });

//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });

// const startServer = async () => {
//   try {
//     await connectToMongoDB();
//     await initializeRedis();
//     if (await test())
//       console.log("Successfuly tested connection to redis and mongo");

//     app.listen(port, () => {
//       console.log(`Server running at http://localhost:${port}`);
//     });
//   } catch (error) {
//     console.error("Error starting server:", error);
//     process.exit(1);
//   }
// };

// startServer();
