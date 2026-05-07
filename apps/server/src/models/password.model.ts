import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
  { hash: { type: String, required: true } },
  { timestamps: true },
);

export const PasswordModel = mongoose.model("Password", passwordSchema);
