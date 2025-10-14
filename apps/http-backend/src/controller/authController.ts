import type { Request, Response } from "express";
import { client, Prisma } from "@repo/db"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

//helper function
const generateJWT = (user: { id: string }): string => {
    const SECRET = process.env.JWT_SECRET;

    if (!SECRET) throw new Error("JWT is not defined in the environment variable");

    return jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
}

const signUpController = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await client.user.create({
            data: {
                name: name,
                email: email,
                password: hashPassword
            }
        });

        const token = generateJWT(newUser);

        res.status(201).json({
            success: true,
            message: "user signup successfully.",
            token: token
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            logger.error("authController", "signUpController", "User already exist", error);
            return res.status(400).json({
                success: false,
                message: "User already exist."
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

const signInController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await client.user.findUnique({
            where: { email }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isValid = await bcrypt.compare(password, existingUser.password);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const token = generateJWT(existingUser);

        res.status(200).json({
            success: true,
            message: "Signin successful.",
            token: token
        });
    } catch (error) {
        res.status(500).json({
            sucess: false,
            message: "Internal server error."
        });
    }
}

export { signInController, signUpController };

