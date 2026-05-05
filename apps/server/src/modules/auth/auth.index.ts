import { OpenAPIHono } from "@hono/zod-openapi";
import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const auth = new OpenAPIHono();

auth.openapi(routes.statusRoute, handlers.status);
auth.openapi(routes.setupRoute, handlers.setup);
auth.openapi(routes.loginRoute, handlers.login);
auth.openapi(routes.changePasswordRoute, handlers.changePassword);
auth.openapi(routes.recoverRoute, handlers.recover);
auth.openapi(routes.logoutRoute, handlers.logout);

export default auth;

