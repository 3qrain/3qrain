import { apiClient } from "~/lib/axios";
import type { Tag } from "./types";

export async function getTags() {
  const { data } = await apiClient.get<{ data: Tag[] }>("/admin/tags");
  return data.data;
}

export async function createTag(body: { name: string; slug: string }) {
  const { data } = await apiClient.post<{ data: Tag }>("/admin/tags", body);
  return data.data;
}

export async function updateTag(id: number, body: { name?: string; slug?: string }) {
  const { data } = await apiClient.patch<{ data: Tag }>(`/admin/tags/${id}`, body);
  return data.data;
}

export async function deleteTag(id: number) {
  const { data } = await apiClient.delete(`/admin/tags/${id}`);
  return data;
}
