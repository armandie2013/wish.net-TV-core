import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function touchUserPresence(userId: string) {
  await connectDB();

  await User.findByIdAndUpdate(userId, {
    lastSeen: new Date(),
  });
}