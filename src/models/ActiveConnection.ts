import mongoose, { Schema, models, model } from "mongoose";

const ActiveConnectionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: false,
      default: null,
    },

    channelName: {
      type: String,
      required: false,
      default: "",
    },

    ip: {
      type: String,
      required: false,
      default: "",
    },

    userAgent: {
      type: String,
      required: false,
      default: "",
    },

    strategy: {
      type: String,
      required: false,
      default: "",
    },

    streamUrl: {
      type: String,
      required: false,
      default: "",
    },

    nodeId: {
      type: Schema.Types.ObjectId,
      ref: "LocationNode",
      required: false,
      default: null,
    },

    nodeName: {
      type: String,
      required: false,
      default: "",
    },

    nodeCode: {
      type: String,
      required: false,
      default: "",
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ActiveConnectionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
ActiveConnectionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ActiveConnection =
  models.ActiveConnection ||
  model("ActiveConnection", ActiveConnectionSchema);

export default ActiveConnection;