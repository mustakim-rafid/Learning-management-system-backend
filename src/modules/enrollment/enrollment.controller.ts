import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { enrollmentServices } from "./enrollment.service";
import { UserJwtPayload } from "../../types";
import httpStatus from "http-status"
import { pick } from "../../helpers/pick";
import { paginationParameters } from "../user/user.constants";

const enrollStudent = catchAsync(async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  const result = await enrollmentServices.enrollStudent(req.body.courseId, req.user as UserJwtPayload)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Success! Please pay to complete the enrollment",
    data: result
  });
});

const enrollmentPayment = catchAsync(async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  const enrollmentId = req.params.enrollmentId;
  const result = await enrollmentServices.enrollmentPayment(enrollmentId as string, req.user as UserJwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment url retrieved successfully",
    data: result,
  });
});

const paymentVerification = catchAsync(async (req: Request, res: Response) => {
    await enrollmentServices.paymentVerification(req, res)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "WebHook req send successfully",
        data: {}
    });
});

const getEnrollmentsByCourse = catchAsync(async (req: Request, res: Response) => {
  const paginations = pick(req.query, paginationParameters);
  const filters = pick(req.query, ["searchTerm"]);
  const result = await enrollmentServices.getEnrollmentsByCourse(req.body.courseId, paginations, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Enrolled student retrieved successfully",
    success: true,
    meta: {
      ...result.meta,
    },
    data: result.data,
  });
});

const markLessonCompleted = catchAsync(async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  const result = await enrollmentServices.markLessonCompleted(req.body.lessonId, req.user as UserJwtPayload)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Lesson marked as completed",
    success: true,
    data: result
  });
});

const getStudentCourses = catchAsync(async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  const result = await enrollmentServices.getStudentCourses(req.user as UserJwtPayload);
    sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Student courses retrieved successfully",
    success: true,
    data: result
  });
});

export const enrollmentControllers = {
  enrollStudent,
  enrollmentPayment,
  paymentVerification,
  getEnrollmentsByCourse,
  markLessonCompleted,
  getStudentCourses
}