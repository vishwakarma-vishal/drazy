import { log } from "@repo/common";

const makeLogger = (scope: string) => ({
    info: (fileName: string, funcName: string, message: string, data?: any):void =>
        log.info(scope, fileName, funcName, message, data),

    warn: (fileName: string, funcName: string, warning: string, data?: any):void =>
        log.warn(scope, fileName, funcName, warning, data),

    error: (fileName: string, funcName: string, message: string, err?: any):void =>
        log.error(scope, fileName, funcName, message, err)
});

const logger = makeLogger("HTTP");

export { logger };