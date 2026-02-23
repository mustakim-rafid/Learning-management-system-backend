import z from "zod";

const enrollmentInputZodSchema = z.object({
    courseId: z.string().nonempty("Course id is required")
})

export const enrollmentValidations = {
    enrollmentInputZodSchema
}