import { createApp } from "~/lib/core/create-app";
import { authGuard } from "~/middleware/auth-guard";
import * as accountHandlers from "./account/account.handlers";
import * as accountRoutes from "./account/account.routes";

const admin = createApp();

admin.use("*", authGuard);

admin.openapi(accountRoutes.changePasswordRoute, accountHandlers.changePassword);
admin.openapi(accountRoutes.logoutRoute, accountHandlers.logout);

export default admin;
