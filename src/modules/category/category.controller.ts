import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { categoryServices } from "./category.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryServices.createCategory(req.body)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: result
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryServices.deleteCategory(req.params.id as string)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category deleted successfully",
    data: result
  });
});

export const categoryControllers = {
    createCategory,
    deleteCategory
}