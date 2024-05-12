"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_proxy_1 = __importDefault(require("http-proxy"));
const client_1 = require("../../node_modules/.prisma/client");
const prisma = new client_1.PrismaClient();
const PORT = 8000;
const app = (0, express_1.default)();
const BASE_URL = `https://jercel.s3.ap-south-1.amazonaws.com/__outputs`;
const proxy = http_proxy_1.default.createProxy();
function incrementViewers(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.viewers.update({
            where: {
                projectId: projectId,
            },
            data: {
                viewers: {
                    increment: 1,
                },
            },
        });
        console.log("exists", projectId);
    });
}
app.use((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const host = req.hostname;
    const slug = host.split(".")[0];
    // console.log(slug);
    const project = yield prisma.project.findUnique({
        where: {
            subdomain: slug,
        },
    });
    console.log(project);
    // if (project) {
    //     incrementViewers(project.id);
    // }
    const resolvesTo = `${BASE_URL}/${project === null || project === void 0 ? void 0 : project.id}`;
    return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
}));
proxy.on("proxyReq", (proxyReq, req, res) => {
    const url = req.url;
    // url is all after port
    // proxyReq.path is resolveto + url
    console.log("hi from proxy");
    if (url === "/") {
        proxyReq.path += "index.html";
    }
    return proxyReq;
});
app.listen(PORT, () => {
    console.log("listening on port " + PORT);
});
