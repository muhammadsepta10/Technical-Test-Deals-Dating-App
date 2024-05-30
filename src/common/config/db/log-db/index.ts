import {registerAs} from "@nestjs/config";
export default registerAs("log-db", () => ({
    TYPE: process.env.LOG_DB_TYPE,
    URL: process.env.LOG_DB_URL,
}));
