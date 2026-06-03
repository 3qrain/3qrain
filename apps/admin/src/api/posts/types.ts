import type { Category } from "~/api/categories/types";
import type { Tag } from "~/api/tags/types";

export interface Post {
  id: number;
  title: string;
  slug: string;
  summary: string;
  cover: string;
  content: string;
  status: "draft" | "published" | "archived";
  isPinned: boolean;
  viewCount: number;
  categoryId: number;
  category?: Category;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface PostListResult {
  list: Post[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PostListQuery {
  keyword?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreatePostBody {
  title?: string;
  slug?: string;
  summary?: string;
  cover?: string;
  content?: string;
  status?: string;
  isPinned?: boolean;
  categoryId?: number;
  tagIds?: number[];
}

export interface UpdatePostBody {
  title?: string;
  slug?: string;
  summary?: string;
  cover?: string;
  content?: string;
  status?: string;
  isPinned?: boolean;
  categoryId?: number;
  tagIds?: number[];
}
