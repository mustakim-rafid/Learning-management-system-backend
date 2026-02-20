import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import bcrypt from "bcryptjs"
import config from "../../config";
import { prisma } from "../../helpers/prisma";
import { Role } from "../../generated/prisma/enums";

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
        role: Role.ADMIN
    }
  })

  return result
};

export const userServices = {
  createAdmin,
};
