import z from "zod";

const categoryInputZodSchema = z.object({
    name: z.string().nonempty("Category name is required"),
    description: z.string().optional()
})

export const categoryValidations = {
    categoryInputZodSchema
}