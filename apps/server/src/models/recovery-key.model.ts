import mongoose from "mongoose";

const recoveryKeySchema = new mongoose.Schema(
  {
    hash: { type: String, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const RecoveryKeyModel = mongoose.model("RecoveryKey", recoveryKeySchema);
