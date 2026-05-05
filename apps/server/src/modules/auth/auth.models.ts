import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
  {
    hash: { type: String, required: true },
  },
  { timestamps: true },
);

const recoveryKeySchema = new mongoose.Schema(
  {
    hash: { type: String, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const PasswordModel = mongoose.model("Password", passwordSchema);
export const RecoveryKeyModel = mongoose.model("RecoveryKey", recoveryKeySchema);
