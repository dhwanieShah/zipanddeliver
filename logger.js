var log4js = require("log4js");
let path = require("path");
log4js.configure({
    appenders: {
        out: { type: "stdout" },
        app: {
            type: "dateFile",
            filename: path.join(__dirname, "./logs/all-logs.log"),
            maxLogSize: 10485760, // 10 MB max size
            backups: 4,
            compress: true,
        },
        usersLogs: {
            type: "dateFile",
            filename: path.join(__dirname, "./logs/usersLogs/all-logs.log"),
            maxLogSize: 10485760, // 10 MB max size
            backups: 4,
            compress: true,
        },
    },
    categories: {
        default: { appenders: ["out", "app"], level: "debug" },
        usersLogs: {
            appenders: ["usersLogs"],
            level: "debug",
        },
    },
});
const logger = log4js.getLogger();
logger.level = "debug";
const usersLogsLogger = log4js.getLogger("usersLogs");

module.exports = {
    logger,
    usersLogsLogger
};