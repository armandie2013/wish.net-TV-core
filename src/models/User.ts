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
    isProtected: {
      type: Boolean,
      default: false,
      required: true,
    },
    localidad: {
      type: String,
      default: "",
      trim: true,
    },
    localidadId: {
      type: Schema.Types.ObjectId,
      ref: "LocationNode",
      default: null,
    },
    conexionesPermitidas: {
      type: Number,
      default: 1,
      min: 1,
    },
    tokenExpiresIn: {
      type: String,
      enum: ["8h", "12h", "24h", "48h", "10d", "20d", "30d", "60d"],
      default: "30d",
      required: true,
      trim: true,
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

userSchema.index({ localidadId: 1 });
userSchema.index({ rol: 1, estado: 1 });
userSchema.index({ isProtected: 1 });

const User = models.User || model("User", userSchema);

export default User;