import { Schema, model, models } from "mongoose";

const locationNodeSchema = new Schema(
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
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    streamingNodeId: {
      type: Schema.Types.ObjectId,
      ref: "StreamingNode",
      default: null,
    },
    fallbackStreamingNodeId: {
      type: Schema.Types.ObjectId,
      ref: "StreamingNode",
      default: null,
    },
    estado: {
      type: String,
      enum: ["activo", "suspendido"],
      default: "activo",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LocationNode =
  models.LocationNode || model("LocationNode", locationNodeSchema);

export default LocationNode;