import { apiClient } from '~/lib/axios'
import type { Note } from './types'

export async function getNotes(params?: { page?: number; pageSize?: number; deleted?: boolean }) {
  const { data } = await apiClient.get<{ data: { list: Note[]; total: number; page: number; pageSize: number } }>('/admin/notes', { params })
  return data.data
}

export async function createNote(body: { content: string; isPublished?: boolean; tagIds?: number[]; mediaIds?: number[] }) {
  const { data } = await apiClient.post<{ data: Note }>('/admin/notes', body)
  return data.data
}

export async function updateNote(id: number, body: { content?: string; isPublished?: boolean; tagIds?: number[]; mediaIds?: number[] }) {
  const { data } = await apiClient.patch<{ data: Note }>(`/admin/notes/${id}`, body)
  return data.data
}

export async function deleteNote(id: number) {
  const { data } = await apiClient.delete(`/admin/notes/${id}`)
  return data
}

export async function restoreNote(id: number) {
  const { data } = await apiClient.post(`/admin/notes/${id}/restore`)
  return data
}

export async function destroyNote(id: number) {
  const { data } = await apiClient.delete(`/admin/notes/${id}/destroy`)
  return data
}
