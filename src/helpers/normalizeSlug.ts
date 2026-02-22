import { prisma } from "./prisma";

export const normalizeSlug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 200);

export const generateUniqueSlug = async (title: string) => {
  const base = normalizeSlug(title);
  let slug = base;
  let count = 0;
  while (true) {
    const found = await prisma.course.findUnique({ where: { slug } });
    if (!found) return slug;
    count += 1;
    slug = `${base}-${count}`;
    if (count > 1000) throw new Error("Could not generate unique slug");
  }
};