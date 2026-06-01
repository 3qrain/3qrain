import { createApp } from "~/lib/core/create-app";
import * as handlers from "./categories.handlers";
import * as routes from "./categories.routes";

const categoriesRouter = createApp();

categoriesRouter.openapi(routes.listCategoriesRoute, handlers.list);
categoriesRouter.openapi(routes.createCategoryRoute, handlers.create);
categoriesRouter.openapi(routes.updateCategoryRoute, handlers.update);
categoriesRouter.openapi(routes.deleteCategoryRoute, handlers.remove);

export default categoriesRouter;
