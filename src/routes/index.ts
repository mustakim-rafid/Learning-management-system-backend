import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { courseRoutes } from "../modules/course/course.routes";
import { lessonRoutes } from "../modules/lesson/lesson.routes";

const router = Router();

const moduleRoutes: {
  path: string;
  route: Router;
}[] = [
  {
    path: "/user",
    route: userRoutes
  },
  {
    path: "/auth",
    route: authRoutes
  },
  {
    path: "/category",
    route: categoryRoutes
  },
  {
    path: "/course",
    route: courseRoutes
  },
  {
    path: "/lesson",
    route: lessonRoutes
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
