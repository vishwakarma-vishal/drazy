import { state } from "../state/state";

const DEBUG = process.env.DEBUG === "true";

if (process.env.DEBUG === undefined) throw new Error("DEBUG is not defined in the env file.");

// helper functions (use to debug)
const printUser = () => {
    if (!DEBUG) return;
    console.log("🟢 Current Users:");
    state.users.forEach((user, userId) => {
        console.log(`- UserID: ${userId}`, {
            ws: user.ws.readyState === 1 ? "OPEN" : "CLOSED",
            rooms: Array.from(user.rooms),
        });
    });
}

const printRoom = () => {
    if (!DEBUG) return;
    console.log("🔵 Current Rooms:");
    state.rooms.forEach((users, roomId) => {
        console.log(`- RoomID: ${roomId}`, Array.from(users));
    });
}

const printPendingShapeOps = () => {
    if (!DEBUG) return;
    console.log("🟡 Pending Shape ops:");
    state.pendingShapeOps.forEach((entry) => {
        console.log({
            id: entry.id,
            ops: entry.ops,
        });
    });
}

const printState = () => {
    if (!DEBUG) return;

    printUser();
    printRoom();
    printPendingShapeOps();
};

export { printRoom, printUser, printState };

