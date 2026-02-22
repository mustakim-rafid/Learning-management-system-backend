import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";
import { zodValidator } from "../../middleware/validator";
import { categoryValidations } from "./category.validation";
import { categoryControllers } from "./category.controller";

const router = Router()

router.route("/").post(
    checkAuth(Role.ADMIN),
    zodValidator(categoryValidations.categoryInputZodSchema),
    categoryControllers.createCategory
)

router.route("/:id").delete(
    checkAuth(Role.ADMIN),
    categoryControllers.deleteCategory
)

export const categoryRoutes = router