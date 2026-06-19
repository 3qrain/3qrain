import { apiClient } from "~/lib/axios";
import type { ChangePasswordPayload } from "./types";

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await apiClient.post("/admin/change-password", payload);
  return data;
}
