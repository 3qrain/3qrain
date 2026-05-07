import { createApp } from "~/lib/core/create-app";
import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const authRouter = createApp();

authRouter.openapi(routes.statusRoute, handlers.status);
authRouter.openapi(routes.setupRoute, handlers.setup);
authRouter.openapi(routes.loginRoute, handlers.login);
authRouter.openapi(routes.recoverRoute, handlers.recover);

export default authRouter;
