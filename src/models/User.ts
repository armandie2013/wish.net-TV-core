import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    rol: {
      type: String,
      enum: ["admin", "operador", "cliente"],
      default: "cliente",
    },
    estado: {
      type: String,
      enum: ["activo", "suspendido"],
      default: "activo",
    },
    localidad: {
      type: String,
      default: "principal",
    },
    conexionesPermitidas: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type IUser = InferSchemaType<typeof userSchema> & {
  _id: string;
};

const User = models.User || model("User", userSchema);

export default User;