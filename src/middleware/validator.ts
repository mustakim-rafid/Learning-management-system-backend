import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const zodValidator = (schema: ZodObject, fieldName?: string | undefined) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (fieldName) {
            req.body = await schema.parseAsync(JSON.parse(req.body[fieldName]))
        } else {
            req.body = await schema.parseAsync(req.body)
        }
        next()
    } catch (error) {
        next(error)
    }
} 