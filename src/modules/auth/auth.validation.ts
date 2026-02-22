import z from "zod";

export const loginInputZodSchema = z.object({
    email: z.email("Invalid email").nonempty("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long")
})