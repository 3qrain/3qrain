import { createApp } from "~/lib/core/create-app";
import userRouter from "./user";

const publicRouter = createApp();

publicRouter.route("/", userRouter);

export default publicRouter;
