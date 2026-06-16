import { createApp } from "~/lib/core/create-app";
import * as handlers from "./media.handlers";
import * as routes from "./media.routes";

const mediaRouter = createApp();

mediaRouter.openapi(routes.listMediaRoute, handlers.list);
mediaRouter.openapi(routes.deleteMediaRoute, handlers.remove);
mediaRouter.openapi(routes.healthRoute, handlers.health);

export default mediaRouter;
