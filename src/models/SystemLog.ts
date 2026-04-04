import { Schema, model, models } from "mongoose";

const systemLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actorName: {
      type: String,
      default: null,
      trim: true,
    },
    actorEmail: {
      type: String,
      default: null,
      trim: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetName: {
      type: String,
      default: null,
      trim: true,
    },
    targetEmail: {
      type: String,
      default: null,
      trim: true,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SystemLog = models.SystemLog || model("SystemLog", systemLogSchema);

export default SystemLog;