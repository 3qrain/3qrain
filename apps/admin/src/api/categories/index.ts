import { apiClient } from "~/lib/axios";
import type { Category } from "./types";

export async function getCategories() {
  const { data } = await apiClient.get<{ data: Category[] }>("/admin/categories");
  return data.data;
}

export async function createCategory(body: { name: string; slug: string }) {
  const { data } = await apiClient.post<{ data: Category }>("/admin/categories", body);
  return data.data;
}

export async function updateCategory(id: number, body: { name?: string; slug?: string }) {
  const { data } = await apiClient.patch<{ data: Category }>(`/admin/categories/${id}`, body);
  return data.data;
}

export async function deleteCategory(id: number) {
  const { data } = await apiClient.delete(`/admin/categories/${id}`);
  return data;
}
