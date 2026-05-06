import { createApp } from "~/lib/core/create-app";
import { connectDB } from "~/db";
import { errorHandler } from "~/middleware/error-handler";
import authRoutes from "~/modules/auth/auth.index";
import adminRoutes from "~/modules/admin/admin.index";
import publicRoutes from "~/modules/public/public.index";

await connectDB();

const app = createApp();

app.onError(errorHandler);

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: { title: "3qrain Admin API", version: "1.0.0" },
});

app.route("/api", publicRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);

export default app;

