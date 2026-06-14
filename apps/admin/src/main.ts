import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores";
import "./style.css";
import { initTheme } from "~/css/themes/index.ts";
import "~/css/themes/index.css"
import "vue-sonner/style.css";
import "~/css/tiptap-css/index.css"
initTheme();

createApp(App).use(pinia).use(router).mount("#app");
