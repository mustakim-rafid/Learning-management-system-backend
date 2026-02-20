import z from "zod";

const userInputZodSchema = z.object({
    name: z.string().optional(),
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long")
})

export const userValidations = {
    userInputZodSchema
}