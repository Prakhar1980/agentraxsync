import { Schema, model, models } from "mongoose";

interface ISettings {
  ownerId: string;
  businessName: string;
  supportEmail: string;
  knowledge: string;
  welcomeMessage?: string;
  agentHintMessage?: string;
}

const settingSchema = new Schema<ISettings>(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true,
    },

    businessName: {
      type: String,
      required: true,
    },

    supportEmail: {
      type: String,
      required: true,
    },

    knowledge: {
      type: String,
      default: "",
    },
    welcomeMessage: {
      type: String,
      default: "",
    },

    agentHintMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Settings =
  models.Settings || model<ISettings>("Settings", settingSchema);

export default Settings;