import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../helpers/prisma";
import { Role } from "../../generated/prisma/enums";
import { userSearchableFields } from "./user.constants";
import { Prisma } from "../../generated/prisma/client";
import { IPaginationParameters, normalizePaginationQueryParams } from "../../helpers/normalizeQueryParams";

const createAdmin = async (req: Request) => {
  if (req.file) {
    const uploadResponse = await fileUploader.uploadToCloudinary(req.file);
    req.body.avatarUrl = uploadResponse?.secure_url;
  }

  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_round),
  );

  const result = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      avatarUrl: req.body.avatarUrl,
      role: Role.ADMIN,
    },
  });

  return result;
};

const createInstructor = async (req: Request) => {
  if (req.file) {
    const uploadResponse = await fileUploader.uploadToCloudinary(req.file);
    req.body.avatarUrl = uploadResponse?.secure_url;
  }

  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_round),
  );

  const result = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      avatarUrl: req.body?.avatarUrl,
      role: Role.INSTRUCTOR,
    },
  });

  return result;
};

const createStudent = async (req: Request) => {
  if (req.file) {
    const uploadResponse = await fileUploader.uploadToCloudinary(req.file);
    req.body.avatarUrl = uploadResponse?.secure_url;
  }

  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_round),
  );

  const result = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      avatarUrl: req.body?.avatarUrl,
    },
  });

  return result;
};

const getAllUsers = async (
  paginations: Partial<IPaginationParameters>,
  filters: any
) => {
  const { take, skip, page, sortOrder, sortBy } =
    normalizePaginationQueryParams(paginations);

  const { searchTerm, ...filterOptions } = filters;

  const filterOptionsPairs = Object.entries(filterOptions);

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
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

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    where: whereConditions,
    include: {
      courses: true,
      enrollments: true,
      lessonCompletions: true,
    },
  });

  const sanitized = result.map(({ password, ...rest }) => rest);

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      limit: take,
      page,
      total,
    },
    sanitized,
  };
};


export const userServices = {
  createAdmin,
  createInstructor,
  createStudent,
  getAllUsers
};
