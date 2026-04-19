import mongoose from "mongoose";

const MONGODB_URL: string = process.env.MONGODB_URL || "";

if (!MONGODB_URL) {
  throw new Error("❌ Please define MONGODB_URL in .env");
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (globalWithMongoose.mongoose?.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  if (!globalWithMongoose.mongoose?.promise) {
    globalWithMongoose.mongoose!.promise = mongoose
      .connect(MONGODB_URL)
      .then((m) => {
        console.log("✅ MongoDB Connected");
        return m.connection;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        throw err;
      });
  }

  globalWithMongoose.mongoose!.conn =
    await globalWithMongoose.mongoose!.promise;

  return globalWithMongoose.mongoose!.conn;
}