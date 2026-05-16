import mongoose from "mongoose";
import { ensureDatabaseIndexes } from "@/lib/ensure-database-indexes";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Falta la variable de entorno MONGODB_URI");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = globalCache;

export async function connectDB() {
  if (globalCache.conn) {
    await ensureDatabaseIndexes();
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGODB_URI, {
      dbName: "wishnet_tv_core",
    });
  }

  globalCache.conn = await globalCache.promise;

  await ensureDatabaseIndexes();

  return globalCache.conn;
}