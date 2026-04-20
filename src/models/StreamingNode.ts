import { Schema, model, models } from "mongoose";

const streamingNodeSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    codigo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    tipo: {
      type: String,
      enum: ["origin", "edge"],
      required: true,
      default: "edge",
    },
    urlBase: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
    habilitado: {
      type: Boolean,
      default: true,
      required: true,
    },
    healthCheckPath: {
      type: String,
      default: "/health",
      trim: true,
    },
    healthStatus: {
      type: String,
      enum: ["unknown", "online", "offline"],
      default: "unknown",
      required: true,
    },
    healthTimeoutMs: {
      type: Number,
      default: 2500,
      min: 500,
    },
    lastCheckAt: {
      type: Date,
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
    failureCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastError: {
      type: String,
      default: "",
      trim: true,
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

streamingNodeSchema.index({ codigo: 1 }, { unique: true });
streamingNodeSchema.index({ urlBase: 1 }, { unique: true });
streamingNodeSchema.index({ tipo: 1, estado: 1, habilitado: 1, prioridad: 1 });

const StreamingNode =
  models.StreamingNode || model("StreamingNode", streamingNodeSchema);

export default StreamingNode;