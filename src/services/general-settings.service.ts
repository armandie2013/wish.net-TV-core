import { unstable_noStore as noStore } from "next/cache";
import { connectDB } from "@/lib/db";
import SystemSetting from "@/models/SystemSetting";
import type { UpdateGeneralSettingsInput } from "@/validations/general-settings.validation";

const DEFAULT_APP_NAME = process.env.APP_NAME?.trim() || "wish.net-TV-core";

function mapGeneralSettings(setting: any) {
  return {
    _id: setting?._id ? String(setting._id) : null,
    key: setting?.key || "general",
    nombreEmpresa: setting?.nombreEmpresa?.trim() || DEFAULT_APP_NAME,
    createdAt: setting?.createdAt || null,
    updatedAt: setting?.updatedAt || null,
  };
}

export async function getGeneralSettings() {
  noStore();
  await connectDB();

  const setting = await SystemSetting.findOne({ key: "general" }).lean();

  if (!setting) {
    return {
      _id: null,
      key: "general",
      nombreEmpresa: DEFAULT_APP_NAME,
      createdAt: null,
      updatedAt: null,
    };
  }

  return mapGeneralSettings(setting);
}

export async function updateGeneralSettings(data: UpdateGeneralSettingsInput) {
  await connectDB();

  const nombreEmpresa = data.nombreEmpresa.trim();

  const setting = await SystemSetting.findOneAndUpdate(
    { key: "general" },
    {
      $set: { nombreEmpresa },
      $setOnInsert: { key: "general" },
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
    }
  ).lean();

  return mapGeneralSettings(setting);
}