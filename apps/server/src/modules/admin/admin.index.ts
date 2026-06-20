import { createApp } from "~/lib/core/create-app";
import { authGuard } from "~/middleware/auth-guard";
import accountRouter from "./account/account.index";
import categoriesRouter from "./categories/categories.index";
import tagsRouter from "./tags/tags.index";
import postsRouter from "./posts/posts.index";
import configRouter from "./config/configs.index";
import mediaRouter from "./media/media.index";
import visitorsRouter from "./visitors/visitors.index";
import { tusHandler } from "./upload/tus";

const adminRouter = createApp();

adminRouter.use("*", authGuard);

adminRouter.route("/", configRouter);
adminRouter.route("/", accountRouter);
adminRouter.route("/", categoriesRouter);
adminRouter.route("/", tagsRouter);
adminRouter.route("/", postsRouter);

adminRouter.route("/", mediaRouter);
adminRouter.route("/", visitorsRouter);
adminRouter.all("/upload/*", tusHandler)

export default adminRouter;
