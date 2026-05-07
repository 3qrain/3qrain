import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("~/components/HelloWorld.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("~/views/Login.vue"),
  },
];
