import type { Request, Response } from "express";

const singUpController = (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        res.send("signUpcontroller");
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

