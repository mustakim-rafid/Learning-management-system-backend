import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { userServices } from "./user.service";
import { pick } from "../../helpers/pick";
import { paginationParameters, queryParameters } from "./user.constants";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createAdmin(req)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Admin created successfully",
    data: result
  });
});

const createInstructor = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createInstructor(req)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Instructor created successfully",
    data: result
  });
});

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createStudent(req)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Student created successfully",
    data: result
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const paginations = pick(req.query, paginationParameters);
  const filters = pick(req.query, queryParameters);
  const data = await userServices.getAllUsers(paginations, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    success: true,
    meta: {
      ...data.meta,
    },
    data: data.sanitized,
  });
});

export const userControllers = {
  createAdmin,
  createInstructor,
  createStudent,
  getAllUsers
};
