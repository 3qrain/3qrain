import { createApp } from "~/lib/core/create-app";
import * as handlers from "./tags.handlers";
import * as routes from "./tags.routes";

const tagsRouter = createApp();

tagsRouter.openapi(routes.listTagsRoute, handlers.list);
tagsRouter.openapi(routes.createTagRoute, handlers.create);
tagsRouter.openapi(routes.updateTagRoute, handlers.update);
tagsRouter.openapi(routes.deleteTagRoute, handlers.remove);

export default tagsRouter;
