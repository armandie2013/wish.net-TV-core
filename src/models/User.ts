import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ["admin", "operador", "cliente"],
      default: "cliente",
      required: true,
    },
    estado: {
      type: String,
      enum: ["activo", "suspendido"],
      default: "activo",
      required: true,
    },
    localidad: {
      type: String,
      default: "principal",
      trim: true,
    },
    conexionesPermitidas: {
      type: Number,
      default: 1,
      min: 1,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    playlistToken: {
      type: String,
      default: null,
      index: true,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", userSchema);

export default User;