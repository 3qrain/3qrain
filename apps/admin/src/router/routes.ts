import type { RouteRecordRaw } from 'vue-router'
import { LayoutDashboard, FileText, Settings } from '@lucide/vue'
import AppLayout from '~/layouts/AppLayout.vue'

export const menuRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('~/views/Dashboard.vue'),
    meta: {
      title: '仪表盘',
      icon: LayoutDashboard
    }
  },
  // {
  //   path: '/posts',
  //   name: 'posts',
  //   component: () => import('~/views/Posts.vue'),
  //   meta: {
  //     title: '文章',
  //     icon: FileText
  //   }
  // },
  // {
  //   path: '/settings',
  //   name: 'settings',
  //   component: () => import('~/views/Settings.vue'),
  //   meta: {
  //     title: '设置',
  //     icon: Settings
  //   }
  // }
]

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('~/views/Login.vue')
  },
  {
    path: "/",
    component: AppLayout,
    redirect: "/dashboard",
    children: [...menuRoutes],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    redirect: "/"
  },
]
