import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { userServices } from "./user.service";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createAdmin(req)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Admin created successfully",
    data: result
  });
});

export const userControllers = {
  createAdmin,
};
