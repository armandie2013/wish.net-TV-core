import { Schema, model, models } from "mongoose";

const grillaCanalSchema = new Schema(
  {
    numero: {
      type: Number,
      required: true,
      min: 1,
    },
    orden: {
      type: Number,
      required: true,
      min: 1,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },
    nombreVisible: {
      type: String,
      default: "",
      trim: true,
    },
    habilitado: {
      type: Boolean,
      default: true,
    },
    logo: {
      type: String,
      default: "",
      trim: true,
    },
    categoria: {
      type: String,
      default: "",
      trim: true,
    },
    sourceName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

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
      default: 0,
      min: 0,
    },
    conexionesPermitidas: {
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
    cantidadCanales: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    grillaCanales: {
      type: [grillaCanalSchema],
      default: [],
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