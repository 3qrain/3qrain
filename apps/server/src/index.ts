import { OpenAPIHono } from "@hono/zod-openapi";
import { connectDB } from "~/db";
import { authGuard } from "~/middleware/auth-guard";
import { errorHandler } from "~/middleware/error-handler";
import authRoutes from "~/modules/auth/auth.index";

await connectDB();

const app = new OpenAPIHono();

app.onError(errorHandler);

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: { title: "3qrain Admin API", version: "1.0.0" },
});

app.route("/api/auth", authRoutes);

app.use("/api/auth/change-password", authGuard);
app.use("/api/auth/logout", authGuard);

export default app;
