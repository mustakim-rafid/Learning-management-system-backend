import { JwtPayload } from "jsonwebtoken";
import { Role } from "../generated/prisma/enums";

export type UserJwtPayload = {
    email: string;
    role: Role
} & JwtPayload