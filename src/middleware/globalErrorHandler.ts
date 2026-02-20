import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import getEnvs from "../config/index";
import { Prisma } from "../generated/prisma/client";
import { ZodError } from "zod";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err?.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      (message = "Duplicate key error"),
        (error = err.meta),
        (statusCode = httpStatus.CONFLICT);
    }
    if (err.code === "P1000") {
      (message = "Authentication failed against database server"),
        (error = err.meta),
        (statusCode = httpStatus.BAD_GATEWAY);
    }
    if (err.code === "P2003") {
      (message = "Foreign key constraint failed"),
        (error = err.meta),
        (statusCode = httpStatus.BAD_REQUEST);
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    (message = "Validation Error"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    (message = "Unknown Prisma error occured!"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    (message = "Prisma client failed to initialize!"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  }

  if (err instanceof ZodError) {
    let messageArray: string[] = [];
    for (const issue of err.issues) {
      const field = issue.path.join(".") || "<root>";
      let zodMessage;

      if (
        issue.code === "invalid_format" &&
        issue.message.toLowerCase().includes("email")
      ) {
        zodMessage = `${field}: Please provide a valid email address.`;
      } else if (issue.code === "invalid_type") {
        zodMessage = issue.message
      } else if (issue.code === "too_small") {
        zodMessage = `${field}: Value is too small. Minimum is ${issue.minimum}.`;
      } else if (issue.code === "too_big") {
        zodMessage = `${field}: Value is too large. Maximum is ${issue.maximum}.`;
      } else if (issue.code === "unrecognized_keys") {
        zodMessage = `${field}: Unrecognized keys: ${issue.keys.join(", ")}.`;
      } else if (issue.code === "invalid_union") {
        zodMessage = `${field}: Does not match any allowed type.`;
      } else {
        zodMessage = `${field}: ${issue.message || "Invalid input."}`;
      }

      messageArray.push(zodMessage);
    }
    message = messageArray
  }

  res.status(statusCode).json({
    success,
    message,
    error,
    stack: getEnvs.node_env === "development" ? err?.stack : null,
  });
};

export default globalErrorHandler;
