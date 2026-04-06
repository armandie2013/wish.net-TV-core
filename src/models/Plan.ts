import { Schema, model, models } from "mongoose";

const planSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    conexionesPermitidas: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    estado: {
      type: String,
      enum: ["activo", "suspendido"],
      default: "activo",
      required: true,
    },
    canalesPermitidos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Plan = models.Plan || model("Plan", planSchema);

export default Plan;