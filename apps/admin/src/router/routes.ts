import type { RouteRecordRaw } from 'vue-router'
import { LayoutDashboard, FileText, FolderTree, Tags } from '@lucide/vue'
import AppLayout from '~/layouts/AppLayout.vue'

export const menuRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('~/views/dashboard/Dashboard.vue'),
    meta: {
      title: '仪表盘',
      icon: LayoutDashboard
    }
  },
  {
    path: '/posts',
    name: 'posts',
    component: () => import('~/views/posts/Posts.vue'),
    meta: {
      title: '文章',
      icon: FileText
    }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('~/views/categories/Categories.vue'),
    meta: {
      title: '分类',
      icon: FolderTree
    }
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('~/views/tags/Tags.vue'),
    meta: {
      title: '标签',
      icon: Tags
    }
  },
]

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('~/views/auth/Login.vue')
  },
  {
    path: "/",
    component: AppLayout,
    redirect: "/dashboard",
    children: [
      ...menuRoutes,
      {
        path: '/posts/new',
        name: 'postCreate',
        component: () => import('~/views/posts/PostEdit.vue'),
      },
      {
        path: '/posts/:id',
        name: 'postEdit',
        component: () => import('~/views/posts/PostEdit.vue'),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    redirect: "/"
  },
]
