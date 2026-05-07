import { createApp } from "~/lib/core/create-app";
import * as handlers from "./account.handlers";
import * as routes from "./account.routes";

const accountRouter = createApp();

accountRouter.openapi(routes.changePasswordRoute, handlers.changePassword);
accountRouter.openapi(routes.logoutRoute, handlers.logout);

export default accountRouter;
