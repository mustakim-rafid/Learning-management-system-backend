import z from "zod";

const courseInputZodSchema = z.object({
    title: z.string().nonempty("Title is required"),
    description: z.string().optional(),
    isPaid: z.boolean().optional(),
    price: z.number().optional(),
    categoryId: z.string().optional()
})

const updateCourseZodSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    isPaid: z.boolean().optional(),
    price: z.number().optional(),
    categoryId: z.string().optional()
})

export const courseValidations = {
    courseInputZodSchema,
    updateCourseZodSchema
}