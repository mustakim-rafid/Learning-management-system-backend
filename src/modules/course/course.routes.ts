import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";
import { fileUploader } from "../../helpers/fileUploader";
import { zodValidator } from "../../middleware/validator";
import { courseValidations } from "./course.validation";
import { courseControllers } from "./course.controller";

const router = Router();

router
  .route("/")
  .post(
    checkAuth(Role.INSTRUCTOR),
    fileUploader.upload.single("thumbnail"),
    zodValidator(courseValidations.courseInputZodSchema),
    courseControllers.createCourse,
  );

router
  .route("/:id")
  .patch(
    checkAuth(Role.INSTRUCTOR),
    fileUploader.upload.single("thumbnail"),
    zodValidator(courseValidations.updateCourseZodSchema),
    courseControllers.updateCourse,
  );

router
  .route("/:id")
  .delete(
    checkAuth(Role.INSTRUCTOR, Role.ADMIN),
    courseControllers.softDeleteCourse,
  );

router
  .route("/:id/publish")
  .patch(
    checkAuth(Role.INSTRUCTOR, Role.ADMIN),
    courseControllers.publishCourse,
  );

router.route("/").get(courseControllers.getAllCourses);

router.route("/:id").get(courseControllers.getCourseById);

router
  .route("/:id/lessons")
  .get(
    checkAuth(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT),
    courseControllers.listLessonsByCourse,
  );

export const courseRoutes = router;
