import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { courseServices } from "./course.service";
import { UserJwtPayload } from "../../types";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { paginationParameters } from "../user/user.constants";
import { pick } from "../../helpers/pick";

const createCourse = catchAsync(async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  const result = await courseServices.createCourse(req.body, req, req.user as UserJwtPayload)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Course created successfully",
    data: result
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await courseServices.updateCourse(req.params.id as string, req.body, req)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Course updated successfully",
    data: result
  });
});

const softDeleteCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await courseServices.softDeleteCourse(req.params.id as string)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course deleted successfully",
    data: result
  });
});

const publishCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await courseServices.publishCourse(req.params.id as string)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course published successfully",
    data: result
  });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const paginations = pick(req.query, paginationParameters);
  const filters = pick(req.query, ["categoryId", "isPaid", "instructorId"]);
  const result = await courseServices.getAllCourses(paginations, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Courses retrieved successfully",
    success: true,
    meta: {
      ...result.meta,
    },
    data: result.data,
  });
});

const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const result = await courseServices.getCourseById(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Course retrieved successfully",
    success: true,
    data: result,
  });
});

const listLessonsByCourse = catchAsync(async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  const result = await courseServices.listLessonsByCourse(req.params.courseId as string, req.user as UserJwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course lessons retrieved successfully",
    data: result,
  });
});

export const courseControllers = {
  createCourse,
  updateCourse,
  softDeleteCourse,
  publishCourse,
  getAllCourses,
  getCourseById,
  listLessonsByCourse
}