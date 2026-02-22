import { CreateLessonDTO } from "../modules/lesson/lesson.interface";
import { AppError } from "../utils/AppError";
import httpStatus from "http-status"

export const validateContentFields = (dto: CreateLessonDTO, contentType?: string) => {
  const type = contentType ?? (dto as any).contentType;
  if (type === "VIDEO") {
    const url = (dto as any).contentUrl;
    if (!url) throw new AppError(httpStatus.NOT_FOUND, "contentUrl is required for VIDEO lessons");
  }
  if (type === "TEXT") {
    const txt = (dto as any).contentText;
    if (!txt) throw new AppError(httpStatus.NOT_FOUND, "contentText is required for TEXT lessons");
  }
};