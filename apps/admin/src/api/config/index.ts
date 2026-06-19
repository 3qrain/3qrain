import { apiClient } from "~/lib/axios";
import type { FullConfig } from "./types";

export async function getConfig() {
  const { data } = await apiClient.get<{ data: FullConfig }>("/admin/config");
  return data.data;
}

export async function updateConfig(key: string, body: Record<string, unknown>) {
  const { data } = await apiClient.patch(`/admin/config/${key}`, body);
  return data.data;
}
