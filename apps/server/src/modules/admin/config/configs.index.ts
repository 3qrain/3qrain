import { createApp } from "~/lib/core/create-app";
import * as handlers from "./configs.handlers";
import * as routes from "./configs.routes";

const configRouter = createApp();

configRouter.openapi(routes.getConfigRoute, handlers.getAll);
configRouter.openapi(routes.getConfigByKeyRoute, handlers.getByKey);
configRouter.openapi(routes.updateConfigRoute, handlers.update);

export default configRouter;
