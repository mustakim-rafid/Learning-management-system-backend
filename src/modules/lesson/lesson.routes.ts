import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";
import { fileUploader } from "../../helpers/fileUploader";
import { zodValidator } from "../../middleware/validator";
import { lessonValidations } from "./lesson.validation";
import { lessonControllers } from "./lesson.controller";

const router = Router();

router
  .route("/")
  .post(
    checkAuth(Role.INSTRUCTOR),
    fileUploader.upload.single("video"),
    zodValidator(lessonValidations.createLessonZodSchema),
    lessonControllers.createLesson,
  );

router
  .route("/:id")
  .delete(
    checkAuth(Role.ADMIN, Role.INSTRUCTOR),
    lessonControllers.deleteLesson,
  );

router.route("/:id").get(
  checkAuth(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT),
  lessonControllers.getLesson
)

export const lessonRoutes = router;
