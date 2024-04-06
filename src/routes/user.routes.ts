import { signup, signin } from "controllers/user.controller";
import { Router } from "express";

const router = Router();

router.post("/signup", signup);

router.post("/signin", signin);

export default router;
