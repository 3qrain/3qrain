import { createApp } from "~/lib/core/create-app";
import * as handlers from "./posts.handlers";
import * as routes from "./posts.routes";

const postsRouter = createApp();

postsRouter.openapi(routes.listPostsRoute, handlers.list);
postsRouter.openapi(routes.getPostRoute, handlers.detail);
postsRouter.openapi(routes.createPostRoute, handlers.create);
postsRouter.openapi(routes.updatePostRoute, handlers.update);
postsRouter.openapi(routes.trashPostRoute, handlers.trash)
postsRouter.openapi(routes.destroyPostRoute, handlers.destroy)
postsRouter.openapi(routes.restorePostRoute, handlers.restore)
postsRouter.openapi(routes.emptyTrashRoute, handlers.emptyTrash)

export default postsRouter
