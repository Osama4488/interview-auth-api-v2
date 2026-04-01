import mongoose from "mongoose";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  mongoose.set("strictQuery", true);

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.mongoUri).then((m) => {
      console.log("✅ MongoDB connected");
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}