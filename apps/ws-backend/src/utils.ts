import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { IncomingMessage } from "http";

interface MyJwtToken extends JwtPayload {
        id: string;
}

const validateUser = (request: IncomingMessage): string | null => {
    try {
        let token = null;

        const base = request.headers.host ? `http://${request.headers.host}` : "http://localhost";
        const url = new URL(request.url || "/", base);
        token = url.searchParams.get("token");

        console.log(token);

        if (!token) return null;

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

        const decode = jwt.verify(token, JWT_SECRET) as MyJwtToken;
        return decode.id || null;
    } catch (error) {
        // console.log("Jwt vefification failed with error ->", error);
        return null;
    }
}

export { validateUser };