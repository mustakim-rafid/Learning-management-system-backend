import { Router } from "express";
import { authController } from "./auth.controller";
import { loginInputZodSchema } from "./auth.validation";
import { zodValidator } from "../../middleware/validator";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";

const router = Router()

router.route("/login").post(
    zodValidator(loginInputZodSchema),
    authController.login
)

router.route("/getme").get(authController.getMe)

router.route("/refresh-token").post(authController.refreshToken)

router.route("/change-password").patch(
    checkAuth(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT),
    authController.changePassword
)

export const authRoutes = router