import { Router } from "express";
import { userControllers } from "./user.controller";
import { fileUploader } from "../../helpers/fileUploader";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";
import { zodValidator } from "../../middleware/validator";
import { userValidations } from "./user.validation";

const router = Router()

router.route("/create-admin").post(
    checkAuth(Role.SUPER_ADMIN),
    fileUploader.upload.single("avatar"),
    zodValidator(userValidations.userInputZodSchema),
    userControllers.createAdmin
)

export const userRoutes = router