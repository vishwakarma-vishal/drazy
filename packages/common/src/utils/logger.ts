let DEBUG_SCOPES: string;

if (typeof window === "undefined") {
    // server-side (http, ws, next.js server)
    try {
        // safe only on Node
        const dotenv = require("dotenv");
        dotenv?.config({ path: '../../.env' });
    } catch { }
    DEBUG_SCOPES = process.env.DEBUG_SCOPES || "";
} else {
    // client-side (next.js client)
    DEBUG_SCOPES = process.env.NODE_ENV === "development" ? "NEXT" : "";
}

// DEBUG_SCOPES = "NEXT", "HTTP", "WS", "ALL"
let isInformed: boolean = false;

if (!DEBUG_SCOPES && !isInformed) {
    console.warn("DEBUG_SCOPES is not defined in env file, default set to false");
    isInformed = true;
}

const isTimestampOn: boolean = process.env.IS_TIMESTAMP_ON === "true";

const isScopeEnabled = (scope: string): boolean => {
    if (!DEBUG_SCOPES) {
        return false;
    }

    const SCOPES = DEBUG_SCOPES.split(",").map(s => s.toUpperCase());

    return SCOPES.includes(scope.toUpperCase()) || SCOPES.includes("ALL");
}

const log = {

    info: (scope: string, fileName: string, funcName: string, message: string, data?: any): void => {
        if (!isScopeEnabled(scope)) return;
        const timestamp = new Date().toISOString();
        const output = data ? JSON.stringify(data) : "";
        console.log(`${isTimestampOn ? `[${timestamp}]` : ''}[${scope}:${fileName}:${funcName}] ${message} : ${output}`);
    },

    warn: (scope: string, fileName: string, funcName: string, warning: string, data?: any): void => {
        if (!isScopeEnabled(scope)) return;
        const timestamp = new Date().toISOString();
        const output = data ? JSON.stringify(data) : "";
        console.warn(`${isTimestampOn ? `[${timestamp}]` : ''}[${scope}:${fileName}:${funcName}] ${warning} : ${output}`);
    },

    error: (scope: string, fileName: string, funcName: string, message: string, err?: any): void => {
        if (!isScopeEnabled(scope)) return;
        const timestamp = new Date().toISOString();
        const output = err ? (err instanceof Error ? err.stack : JSON.stringify(err)) : "";
        console.error(`${isTimestampOn ? `[${timestamp}]` : ''}[${scope}:${fileName}:${funcName}] ${message} : ${output}`);
    }
}

export default log;