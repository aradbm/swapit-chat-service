import { redisClient } from "./config/redisSB";
import mongoose, { Document, Schema } from "mongoose";

const testSchema: Schema = new Schema({
  hi: {
    type: String,
    required: true,
    description: "A greeting message",
  },
});

const TestModel = mongoose.model<Document>("Test", testSchema);

const test = async () => {
  try {
    await redisClient.set("hello", "world");
    const res = await redisClient.get("hello");
    if (res !== "world") throw "error setting";

    const newTest = new TestModel({ hi: "test" });
    await newTest.save();
    // console.log('Document inserted into MongoDB');

    // console.log('Successfully set and retrieved value from Redis');
    // console.log('Document inserted into MongoDB:', newTest);
    return true;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error occurred:", err.message);
    } else {
      console.error("An unknown error occurred:", err);
    }
  } finally {
    await redisClient.quit();
  }
};

export default test;
