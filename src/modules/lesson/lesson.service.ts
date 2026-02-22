import { Request } from "express";
import { prisma } from "../../helpers/prisma";
import { validateContentFields } from "../../helpers/validateContentField";
import { CreateLessonDTO } from "./lesson.interface";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { UserJwtPayload } from "../../types";

export const createLesson = async (courseId: string, dto: CreateLessonDTO) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  if (course.deletedAt)
    throw new AppError(httpStatus.NOT_FOUND, "Course deleted");

  validateContentFields(dto);

  return await prisma.$transaction(async (tx) => {
    const maxRes = await tx.lesson.findFirst({
      where: { courseId },
      orderBy: { lessonOrder: "desc" },
      select: { lessonOrder: true },
    });
    const maxOrder = maxRes?.lessonOrder ?? 0;

    let targetOrder =
      dto.order && dto.order > 0
        ? Math.min(dto.order, maxOrder + 1)
        : maxOrder + 1;

    if (targetOrder <= maxOrder) {
      await tx.lesson.updateMany({
        where: { courseId, lessonOrder: { gte: targetOrder } },
        data: { lessonOrder: { increment: 1 } },
      });
    }

    const lesson = await tx.lesson.create({
      data: {
        courseId,
        title: dto.title,
        contentType: dto.contentType,
        contentUrl: dto.contentUrl ?? null,
        contentText: dto.contentText ?? null,
        lessonOrder: targetOrder,
        isPreview: dto.isPreview ?? false,
        duration: dto.duration ?? null,
      },
    });

    return lesson;
  });
};

export const deleteLesson = async (lessonId: string) => {
  return await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");

    const course = await tx.course.findUnique({
      where: { id: lesson.courseId },
    });
    if (!course)
      throw new AppError(httpStatus.NOT_FOUND, "Parent course not found");

    const oldOrder = lesson.lessonOrder;

    await tx.lessonCompletion.deleteMany({ where: { lessonId } });

    await tx.lesson.delete({ where: { id: lessonId } });

    await tx.lesson.updateMany({
      where: { courseId: lesson.courseId, lessonOrder: { gt: oldOrder } },
      data: { lessonOrder: { decrement: 1 } },
    });

    return { success: true };
  });
};

export const getLesson = async (lessonId: string, user: UserJwtPayload) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          id: true,
          status: true,
          instructor: {
            select: {
              email: true,
            },
          },
          deletedAt: true,
          isPaid: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");
  }

  if (lesson.course.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not available");
  }

  if (user.role === "ADMIN") {
    return lesson;
  }

  if (lesson.course.instructor.email === user.email) {
    return lesson;
  }

  if (!lesson.course.isPaid) {
    return lesson;
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId: lesson.course.id,
      student: {
        email: user.email,
      },
    },
  });

  if (!enrollment) {
    const { contentUrl, contentText, duration, ...rest } = lesson;
    return rest;
  }

  return lesson;
};

export const lessonServices = {
  createLesson,
  deleteLesson,
  getLesson,
};
