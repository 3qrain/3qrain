import { createApp } from "~/lib/core/create-app";
import { authGuard } from "~/middleware/auth-guard";
import accountRouter from "./account/account.index";
import categoriesRouter from "./categories/categories.index";
import tagsRouter from "./tags/tags.index";
import postsRouter from "./posts/posts.index";
import configRouter from "./config/configs.index";

const adminRouter = createApp();

adminRouter.use("*", authGuard);

adminRouter.route("/", configRouter);
adminRouter.route("/", accountRouter);
adminRouter.route("/", categoriesRouter);
adminRouter.route("/", tagsRouter);
adminRouter.route("/", postsRouter);

export default adminRouter;
