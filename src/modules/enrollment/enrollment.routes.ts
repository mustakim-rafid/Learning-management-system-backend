import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";
import { zodValidator } from "../../middleware/validator";
import { enrollmentValidations } from "./enrollment.validation";
import { enrollmentControllers } from "./enrollment.controller";

const router = Router()

router.route("/").post(
    checkAuth(Role.STUDENT),
    zodValidator(enrollmentValidations.enrollmentInputZodSchema),
    enrollmentControllers.enrollStudent,
);

router.route("/:enrollmentId/payment").post(
    checkAuth(Role.STUDENT),
    enrollmentControllers.enrollmentPayment
);

router.route("/").get(
    checkAuth(Role.INSTRUCTOR, Role.ADMIN),
    enrollmentControllers.getEnrollmentsByCourse
)

router.route("/mark-lesson-completed").patch(
    checkAuth(Role.STUDENT),
    enrollmentControllers.markLessonCompleted
)

router.route("/student-courses").get(
    checkAuth(Role.STUDENT),
    enrollmentControllers.getStudentCourses
)

export const enrollmentRoutes = router;