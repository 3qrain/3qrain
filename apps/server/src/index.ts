import { createApp } from "~/lib/core/create-app";
import { connectDB } from "~/db";
import { errorHandler } from "~/middleware/error-handler";
import authRouter from "~/modules/auth/auth.index";
import adminRouter from "~/modules/admin/admin.index";
import publicRouter from "~/modules/public/public.index";

await connectDB();

const app = createApp();

app.onError(errorHandler);

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: { title: "3qrain Admin API", version: "1.0.0" },
});

app.route("/api", publicRouter);
app.route("/api/auth", authRouter);
app.route("/api/admin", adminRouter);

export default app;
