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

router.route("/create-instructor").post(
    fileUploader.upload.single("avatar"),
    zodValidator(userValidations.userInputZodSchema),
    userControllers.createInstructor
)

router.route("/create-student").post(
    fileUploader.upload.single("avatar"),
    zodValidator(userValidations.userInputZodSchema),
    userControllers.createStudent
)

router.route("/").get(
    checkAuth(Role.SUPER_ADMIN),
    userControllers.getAllUsers
)

export const userRoutes = router