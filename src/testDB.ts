import { redisSubClient, redisPubClient } from "./config/redisSB";
import mongoose from "mongoose";

const test = async () => {
  try {
    // Test Redis pub/sub
    let testMessage: string = "";
    await redisSubClient.subscribe("test-channel", (message) => {
      testMessage = message;
    });
    await redisPubClient.publish("test-channel", "success");
    if (testMessage !== "success") throw new Error("Redis pub/sub test failed");
    await redisSubClient.unsubscribe("test-channel");

    // Test MongoDB
    const testSchema = new mongoose.Schema({ hi: String });
    const TestModel = mongoose.model("Test", testSchema, "tests");
    const newTest = new TestModel({ hi: "test" });
    await newTest.save();
    await TestModel.deleteOne({ _id: newTest._id });

    return true;
  } catch (err) {
    console.error("Test failed:", err instanceof Error ? err.message : err);
    return false;
  }
};

export default test;
