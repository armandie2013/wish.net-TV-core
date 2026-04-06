import { Schema, model, models } from "mongoose";

const m3uSourceSchema = new Schema(
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
    tipoEntrada: {
      type: String,
      enum: ["url"],
      default: "url",
      required: true,
    },
    urlFuente: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["activo", "suspendido"],
      default: "activo",
      required: true,
    },
    prioridad: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    localidad: {
      type: String,
      default: "general",
      trim: true,
    },
    importacionAutomatica: {
      type: Boolean,
      default: false,
    },
    intervaloMinutos: {
      type: Number,
      default: 60,
      min: 1,
    },
    ultimaImportacion: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const M3uSource = models.M3uSource || model("M3uSource", m3uSourceSchema);

export default M3uSource;