import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { fileUploader } from "../../helpers/fileUploader";
import { lessonServices } from "./lesson.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { UserJwtPayload } from "../../types";

const createLesson = catchAsync(async (req: Request, res: Response) => {
  if (req.file && (req.body.contentType === "PDF" || req.body.contentType === "VIDEO")) {
    const uploadResponse = await fileUploader.uploadToCloudinary(req.file);
    req.body.contentUrl = uploadResponse?.secure_url;
  }
  const result = await lessonServices.createLesson(req.body.courseId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Lesson created successfully",
    data: result,
  });
});

const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await lessonServices.deleteLesson(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Lesson deleted successfully",
    data: result,
  });
});

const getLesson = catchAsync(async (req: Request & { user?: UserJwtPayload }, res: Response) => {
  const result = await lessonServices.getLesson(req.params.id as string, req.user as UserJwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Lesson retrieved successfully",
    data: result,
  });
});

export const lessonControllers = {
    createLesson,
    deleteLesson,
    getLesson,
}
