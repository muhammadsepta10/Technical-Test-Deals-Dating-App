import {registerAs} from "@nestjs/config";
export default registerAs("gw", () => ({
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
}));
