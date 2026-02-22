import { z } from "zod";

export const createLessonZodSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),

    courseId: z.string().nonempty("Course is required"),

    contentType: z.enum(["VIDEO", "TEXT"]),

    contentUrl: z.string().nullable().optional(),

    contentText: z
      .string()
      .min(1, "contentText cannot be empty")
      .nullable()
      .optional(),

    duration: z
      .number()
      .int("Duration must be an integer")
      .positive("Duration must be positive")
      .nullable()
      .optional(),

    order: z
      .number()
      .int("Order must be an integer")
      .positive("Order must be greater than 0")
      .nullable()
      .optional(),

    isPreview: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.contentType !== "TEXT" ||
      (data.contentText !== undefined &&
        data.contentText !== null &&
        data.contentText.trim() !== ""),
    {
      message: "contentText is required when contentType is TEXT",
      path: ["contentText"],
    }
  );

export const lessonValidations = {
  createLessonZodSchema
}