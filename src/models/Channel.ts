import { Schema, model, models } from "mongoose";

const channelSchema = new Schema(
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
    categoria: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: "",
      trim: true,
    },
    urlOrigen: {
      type: String,
      required: true,
      trim: true,
    },
    tvgId: {
      type: String,
      default: "",
      trim: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      ref: "M3uSource",
      default: null,
    },
    sourceName: {
      type: String,
      default: "",
      trim: true,
    },
    estado: {
      type: String,
      enum: ["activo", "suspendido"],
      default: "activo",
      required: true,
    },
    lastImportedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Channel = models.Channel || model("Channel", channelSchema);

export default Channel;