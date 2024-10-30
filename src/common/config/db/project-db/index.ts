import {registerAs} from "@nestjs/config";
export default registerAs("project-db", () => ({
    HOST: process.env.PROJECT_DB_HOST,
    USER: process.env.PROJECT_DB_USER,
    PASS: process.env.PROJECT_DB_PASS,
    NAME: process.env.PROJECT_DB_NAME,
    PORT: process.env.PROJECT_DB_PORT,
    TYPE: process.env.PROJECT_DB_TYPE,
}));
