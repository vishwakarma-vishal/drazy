import type { Request, Response } from "express";
import { client, Prisma } from "@repo/db"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const singUpController = async (req: Request, res: Response) => {
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

        res.status(200).json({
            success: true,
            message: "user signup successfully.",
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return res.status(400).json({
                    status: false,
                    message: "User already exist."
                })
            }
        }

        res.status(500).json({
            status: 500,
            message: "Internal server error."
        });
    }
}

const signInController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await client.user.findFirst({
            where: {
                email: email
            }
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

        const SECRET = process.env.JWT_SECRET;

        if (!SECRET) {
            throw new Error("JWT is not defined in the environment varible")
        }

        const token = jwt.sign({
            data: existingUser.id
        }, SECRET, { expiresIn: '1h' });


        res.status(200).json({
            success: true,
            message: "Signin successful.",
            token: token
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal server error."
        });
    }
}

export { signInController, singUpController };

