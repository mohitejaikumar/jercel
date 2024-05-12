"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];
    console.log(authHeader);
    if (!token) {
        return res.status(401).json({ error: "Access denied" });
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = verified.userId;
        next();
    }
    catch (error) {
        return res.status(400).json({ error: "Invalid token" });
    }
};
exports.default = verifyToken;
