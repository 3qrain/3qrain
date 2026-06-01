import { relations } from "drizzle-orm";
import { posts } from "./posts";
import { categories } from "./categories";
import { tags } from "./tags";
import { postTags } from "./post-tags";

export const categoryRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  postTags: many(postTags),
}));

export const postTagRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));
