import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

interface MyJwtToken extends JwtPayload {
    data?: {
        id: string;
    };
}

const validateUser = (token: string) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

        const decode = jwt.verify(token, JWT_SECRET) as MyJwtToken;
        return decode.data?.id;
    } catch (error) {
        console.log("Jwt vefification failed with error ->", error);
        return null;
    }
}

export { validateUser };