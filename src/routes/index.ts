import userRoutes from "./user.routes";
import { Router } from "express";
import cloudRoutes from "./cloud.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/cloud", cloudRoutes);

export default router;
