import type { Request, Response } from "express";
import { prisma } from "@repo/db/index"

const singUpController = (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const newUser = prisma.user.create({
            data: {
                name: name,
                email: email,
                password: password
            }
        })

        res.status(200).json({
            success: true,
            message: "user signup successfully.",
            user: newUser
        });
        return;
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal server error."
        });
        return;
    }
}

const signInController = (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;


        res.send("signInController");
        return;
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal server error."
        });
        return;
    }
}

export { signInController, singUpController };

