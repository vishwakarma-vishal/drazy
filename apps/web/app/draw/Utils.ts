import { JwtPayload, decode } from "jsonwebtoken";
import { devLogger } from "../utils/logger";

interface myJsonPayload extends JwtPayload {
    id: string
}

let shapeCounter = 0;
let lastTimestamp = 0;

export function generateTempId(): string | null {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const decodedToken: myJsonPayload = decode(token) as myJsonPayload;
        const clientId = decodedToken.id;

        // reseting the count every milisecond rare but did it for the cleaner tempId 
        // (rare sinario but future prof if we ever allowed bot/script to create shapes on user behalf)
        const currTimeStamp = Date.now();
        if (currTimeStamp !== lastTimestamp) {
            shapeCounter = 0;
            lastTimestamp = currTimeStamp;
        } else {
            shapeCounter += 1;
        }

        return `${clientId}-${currTimeStamp}-${shapeCounter}`;
    } catch (error) {
        devLogger.error("Helper", "generateTempId", "Error while generating the tempId", error);
        return null;
    }
}



