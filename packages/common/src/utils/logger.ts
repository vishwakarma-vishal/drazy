import dotenv from "dotenv";
dotenv.config({ path: '../../.env' });

// DEBUG = "FRONTEND", "HTTP", "WS", "ALL"

const DEBUG: string = process.env.DEBUG || "";
let isInformed: boolean = false;

const isScopeEnabled = (scope: string): boolean => {
    if (!DEBUG && !isInformed) {
        console.warn("DEBUG is not defined in env file, default set to false");
        isInformed = true;
        return false;
    }

    const DEBUG_SCOPES = DEBUG.split(",").map(s => s.toUpperCase());

    return DEBUG_SCOPES.includes(scope.toUpperCase()) || DEBUG_SCOPES.includes("ALL");
}

const log = {

    info: (scope: string, fileName: string, funcName: string, message: string, data?: any): void => {
        if (!isScopeEnabled(scope)) return;
        const timestamp = new Date().toISOString();
        const output = data ? JSON.stringify(data) : "";
        console.log(`[${timestamp}][${scope}:${fileName}:${funcName}] ${message}`);
        if (output) console.log(`: ${output}`);
    },

    warn: (scope: string, fileName: string, funcName: string, warning: string, data?: any): void => {
        if (!isScopeEnabled(scope)) return;
        const timestamp = new Date().toISOString();
        const output = data ? JSON.stringify(data) : "";
        console.warn(`[${timestamp}][${scope}:${fileName}:${funcName}] ${warning}`);
        if (output) console.log(`: ${output}`);
    },

    error: (scope: string, fileName: string, funcName: string, message: string, err?: any): void => {
        if (!isScopeEnabled(scope)) return;
        const timestamp = new Date().toISOString();
        const output = err ? (err instanceof Error ? err.stack : JSON.stringify(err)) : "";
        console.error(`[${timestamp}][${scope}:${fileName}:${funcName}] ${message}`);
        if (output) console.log(`: ${output}`);
    }
}

export default log;