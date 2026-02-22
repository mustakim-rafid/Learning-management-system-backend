import { Request } from "express";
import { generateUniqueSlug } from "../../helpers/normalizeSlug";
import { prisma } from "../../helpers/prisma";
import { AppError } from "../../utils/AppError";
import { TCreateCourse, TUpdateCourse } from "./course.interface";
import httpStatus from "http-status";
import { fileUploader } from "../../helpers/fileUploader";
import { UserJwtPayload } from "../../types";
import { Role } from "../../generated/prisma/enums";
import { Prisma } from "../../generated/prisma/client";
import { IPaginationParameters, normalizePaginationQueryParams } from "../../helpers/normalizeQueryParams";

const createCourse = async (
  data: TCreateCourse,
  req: Request,
  user: UserJwtPayload,
) => {
  if (req.file) {
    const uploadResponse = await fileUploader.uploadToCloudinary(req.file);
    data.thumbnailUrl = uploadResponse?.secure_url;
  }

  const isPaid = Boolean(data.isPaid);
  const price = isPaid ? (data.price ?? 0) : 0;
  if (isPaid && price <= 0)
    throw new AppError(httpStatus.CONFLICT, "Paid course must have price > 0");
  if (!isPaid && (data.price ?? 0) !== 0)
    throw new AppError(httpStatus.CONFLICT, "Free course must have price = 0");

  if (data.categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!cat) throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  const slug = await generateUniqueSlug(data.title);

  return await prisma.$transaction(async (tnx) => {
    const instructor = await tnx.user.findUniqueOrThrow({
      where: {
        email: user.email,
        role: Role.INSTRUCTOR,
      },
    });

    const course = await tnx.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description ?? null,
        price,
        isPaid,
        thumbnailUrl: data.thumbnailUrl ?? null,
        instructorId: instructor.id,
        categoryId: data.categoryId ?? null,
        status: data.status ?? "DRAFT",
      },
    });

    return course;
  });
};

const updateCourse = async (courseId: string, data: TUpdateCourse, req: Request) => {
  if (req.file) {
    const uploadResponse = await fileUploader.uploadToCloudinary(req.file);
    data.thumbnailUrl = uploadResponse?.secure_url;
  }
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  if (course.deletedAt)
    throw new AppError(httpStatus.FORBIDDEN, "Course is deleted");

  if (data.isPaid !== undefined) {
    if (!data.isPaid && (data.price ?? course.price) !== 0) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Cannot set free course with non-zero price",
      );
    }
    if (data.isPaid && (data.price ?? course.price) <= 0) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Paid courses must have price > 0",
      );
    }
  } else if (data.price !== undefined) {
    if (!course.isPaid && data.price !== 0) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Cannot set price for a free course",
      );
    }
    if (course.isPaid && data.price <= 0) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Paid courses must have price > 0",
      );
    }
  }

  if (data.categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!cat) throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  let slug: string | undefined = undefined;
  if (data.title && data.title !== course.title) {
    slug = await generateUniqueSlug(data.title);
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      title: data.title ?? undefined,
      slug: slug ?? undefined,
      description: data.description ?? undefined,
      price: data.price ?? undefined,
      isPaid: data.isPaid ?? undefined,
      thumbnailUrl: data.thumbnailUrl ?? undefined,
      categoryId: data.categoryId ?? undefined,
      status: data.status ?? undefined,
    },
  });

  return updated;
};

const softDeleteCourse = async (courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course not found");

  const deleted = await prisma.course.update({
    where: { id: courseId },
    data: {
      deletedAt: new Date(),
      status: "ARCHIVED",
    },
  });

  return deleted;
};

const publishCourse = async (courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  if (course.deletedAt)
    throw new AppError(httpStatus.FORBIDDEN, "Course deleted");

  const lessonCount = await prisma.lesson.count({ where: { courseId } });
  if (lessonCount === 0)
    throw new Error("Course must have at least one lesson to publish");

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.course.update({
      where: { id: courseId },
      data: { status: "PUBLISHED", updatedAt: new Date() },
    });
    return u;
  });

  return updated;
};

const getAllCourses = async (
  paginations: Partial<IPaginationParameters>,
  filters: any
) => {
  const { take, skip, page, sortOrder, sortBy } =
    normalizePaginationQueryParams(paginations);

  const { searchTerm, ...filterOptions } = filters;

  const filterOptionsPairs = Object.entries(filterOptions);

  const andConditions: Prisma.CourseWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (filterOptionsPairs.length > 0) {
    andConditions.push({
      AND: filterOptionsPairs.map(([key, value]) => ({
        [key]: {
          equals: value,
        },
      })),
    });
  }

  andConditions.push({
    deletedAt: null,
  });

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.course.findMany({
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    where: whereConditions,
    include: {
      category: true,
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        },
      },
    },
  });

  const total = await prisma.course.count({
    where: whereConditions,
  });

  return {
    meta: {
      limit: take,
      page,
      total,
    },
    data: result,
  };
};

const getCourseById = async (id: string) => {
  const result = await prisma.course.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      category: true,
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      lessons: {
        orderBy: {
          createdAt: "asc",
        },
      },
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  return result;
};

export const listLessonsByCourse = async (
  courseId: string,
  user: UserJwtPayload,
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      status: true,
      instructorId: true,
      deletedAt: true,
    },
  });

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  if (course.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Course deleted");
  }

  const isAdmin = user.role === "ADMIN";
  const isOwner = course.instructorId === user.userId;

  if (!isAdmin && !isOwner && course.status !== "PUBLISHED") {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Sorry course is not published yet",
    );
  }

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { lessonOrder: "asc" },
    select: {
      id: true,
      title: true,
      lessonOrder: true,
      duration: true,
      isPreview: true,
    },
  });

  return lessons;
};

export const courseServices = {
  createCourse,
  updateCourse,
  softDeleteCourse,
  publishCourse,
  getAllCourses,
  getCourseById,
  listLessonsByCourse
};
