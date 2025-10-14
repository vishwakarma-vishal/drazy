import { state } from "../state/state";
import { log } from "@repo/common";

const makeLogger = (scope: string) => ({
    info: (fileName: string, funcName: string, message: string, data?: any): void =>
        log.info(scope, fileName, funcName, message, data),

    warn: (fileName: string, funcName: string, warning: string, data?: any): void =>
        log.warn(scope, fileName, funcName, warning, data),

    error: (fileName: string, funcName: string, message: string, err?: any): void =>
        log.error(scope, fileName, funcName, message, err)
});

const logger = makeLogger("WS");

const fileName = "logger";

const printUser = () => {
    logger.info(fileName, "printUser", "🟢 Current Users:");

    state.users.forEach((user, userId) => {
        logger.info(fileName, "printUser", `UserID: ${userId}`, {
            ws: user.ws.readyState === 1 ? "OPEN" : "CLOSED",
            rooms: Array.from(user.rooms),
        });
    });
}

const printRoom = () => {
    logger.info(fileName, "printRoom", "🔵 Current Rooms:");

    state.rooms.forEach((users, roomId) => {
        logger.info(fileName, "printRoom", `- RoomID: ${roomId}`, users);
    });
}

const printPendingShapeOps = () => {
    logger.info(fileName, "printPendingShapeOps", "🟡 Pending Shape ops:");

    state.pendingShapeOps.forEach((entry, key) => {
        logger.info(fileName, "printPendingShapeOps", `key: ${key}`, entry);
    });
};


const printState = () => {

    logger.info(fileName, "printState", `------------------------State start-----------------------------`)
    printUser();
    printRoom();
    printPendingShapeOps();
    logger.info(fileName, "printState", `------------------------State end-----------------------------`)
};

export { logger, printRoom, printUser, printState };
