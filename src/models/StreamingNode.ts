import { Schema, model, models } from "mongoose";

const streamingNodeSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["origin", "edge"],
      required: true,
      default: "origin",
    },
    urlBase: {
      type: String,
      required: true,
      trim: true,
    },
    host: {
      type: String,
      default: "",
      trim: true,
    },
    puerto: {
      type: Number,
      default: 80,
      min: 1,
    },
    localidad: {
      type: String,
      default: "general",
      trim: true,
    },
    prioridad: {
      type: Number,
      default: 1,
      min: 1,
    },
    estado: {
      type: String,
      enum: ["activo", "suspendido"],
      default: "activo",
      required: true,
    },
    observaciones: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StreamingNode =
  models.StreamingNode || model("StreamingNode", streamingNodeSchema);

export default StreamingNode;