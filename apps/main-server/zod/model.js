"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = exports.projectIdSchema = exports.projectInputSchema = void 0;
const zod_1 = require("zod");
const GitUrlRegex = /^(?:https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.git|git@github\.com:[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.git)$/;
exports.projectInputSchema = zod_1.z.object({
    name: zod_1.z.string(),
    gitURL: zod_1.z.string().refine((val) => GitUrlRegex.test(val), {
        message: "Invalid Git URL",
    }),
    customdomain: zod_1.z.optional(zod_1.z.string()),
});
exports.projectIdSchema = zod_1.z.object({
    projectId: zod_1.z.string(),
});
exports.signUpSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string(),
});
