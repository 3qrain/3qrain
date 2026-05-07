import { apiClient } from "~/lib/axios";
import type { StatusResult, SetupResult } from "./types";

export async function checkStatus() {
  const { data } = await apiClient.get<{ data: StatusResult }>("/auth/status");
  return data.data;
}

export async function setup(password: string) {
  const { data } = await apiClient.post<{ data: SetupResult }>("/auth/setup", { password });
  return data.data;
}

export async function login(password: string) {
  const { data } = await apiClient.post("/auth/login", { password });
  return data;
}
