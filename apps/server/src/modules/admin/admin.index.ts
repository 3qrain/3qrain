import { createApp } from "~/lib/core/create-app";
import { authGuard } from "~/middleware/auth-guard";
import accountRouter from "./account/account.index";

const adminRouter = createApp();

adminRouter.use("*", authGuard);

adminRouter.route("/", accountRouter);

export default adminRouter;
