import type { RouteRecordRaw } from "vue-router";
import AppLayout from "~/layouts/AppLayout.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("~/views/Login.vue"),
  },
  {
    path: "/",
    component: AppLayout,
    children: [
      {
        path: "",
        redirect: "/dashboard",
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("~/views/Dashboard.vue"),
      },
    ],
  },
];
