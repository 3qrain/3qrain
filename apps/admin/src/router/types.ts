import type { Component } from "vue";

export interface AppMenu {
  path: string;

  name: string;

  title: string;

  icon?: Component;

  component?: () => Promise<unknown>;

  children?: AppMenu[];
}