import { Schema, model, models } from "mongoose";

const systemSettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nombreEmpresa: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
  },
  {
    timestamps: true,
  }
);

const SystemSetting =
  models.SystemSetting || model("SystemSetting", systemSettingSchema);

export default SystemSetting;