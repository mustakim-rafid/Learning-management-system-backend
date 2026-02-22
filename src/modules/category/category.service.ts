import { normalizeSlug } from "../../helpers/normalizeSlug";
import { prisma } from "../../helpers/prisma";
import { AppError } from "../../utils/AppError";
import { TCategory } from "./category.interface";
import httpStatus from "http-status";

const createCategory = async (payload: TCategory) => {
  const slug = normalizeSlug(payload.name);

  const existing = await prisma.category.findFirst({
    where: { OR: [{ slug }, { name: payload.name }] },
  });
  if (existing)
    throw new AppError(
      httpStatus.CONFLICT,
      "Category with same name/slug exists",
    );

  const category = await prisma.category.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description ?? null,
    },
  });

  return category;
};

export const deleteCategory = async (id: string) => {
  const courseCount = await prisma.course.count({ where: { categoryId: id } });
  if (courseCount > 0) throw new AppError(httpStatus.FORBIDDEN, "Cannot delete category with courses");

  await prisma.category.delete({ where: { id } });
  return { success: true };
};

export const categoryServices = {
    createCategory,
    deleteCategory
}
