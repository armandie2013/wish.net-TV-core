import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

function generatePlaylistToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function ensureUserPlaylistToken(userId: string) {
  await connectDB();

  const user = await User.findById(userId).select(
    "nombre email playlistToken"
  );

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (!user.playlistToken) {
    user.playlistToken = generatePlaylistToken();
    await user.save();
  }

  return {
    _id: String(user._id),
    nombre: user.nombre,
    email: user.email,
    playlistToken: user.playlistToken,
  };
}

export async function regenerateUserPlaylistToken(userId: string) {
  await connectDB();

  const user = await User.findById(userId).select(
    "nombre email playlistToken"
  );

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  user.playlistToken = generatePlaylistToken();
  await user.save();

  return {
    _id: String(user._id),
    nombre: user.nombre,
    email: user.email,
    playlistToken: user.playlistToken,
  };
}