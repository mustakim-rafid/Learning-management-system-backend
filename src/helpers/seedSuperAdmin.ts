import config from "../config";
import { Role } from "../generated/prisma/enums";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await prisma.user.findUnique({
      where: {
        email: config.super_admin.email,
        role: Role.SUPER_ADMIN
      },
    });

    if (isSuperAdminExists) {
      console.log("Super admin already created.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.super_admin.password as string,
      Number(config.bcrypt_salt_round),
    );

    await prisma.user.create({
      data: {
        email: config.super_admin.email!,
        password: hashedPassword,
        role: Role.SUPER_ADMIN
      },
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.log("Something went wrong while creating the ADMIN user.", error)
  }
};
