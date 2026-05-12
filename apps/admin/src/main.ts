import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores";
import "./style.css";
import { initTheme } from "~/themes";
import "~/themes/light.css";
import "~/themes/dark.css";
import "vue-sonner/style.css";

initTheme();

createApp(App).use(pinia).use(router).mount("#app");
