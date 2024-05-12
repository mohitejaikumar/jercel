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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const random_word_slugs_1 = require("random-word-slugs");
const client_ecs_1 = require("@aws-sdk/client-ecs");
const model_1 = require("./zod/model");
const client_1 = require("../../node_modules/.prisma/client");
const client_2 = require("@clickhouse/client"); // or '@clickhouse/client-web'
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const kafkajs_1 = require("kafkajs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtTokenVerify_1 = __importDefault(require("./middlewares/jwtTokenVerify"));
// import { Server } from 'socket.io';
const app = (0, express_1.default)();
const PORT = 3000;
// const socketPORT = 3001;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const config = {
    CLUSTER: process.env.AWS_CLUSTER,
    TASK: process.env.AWS_TASK,
};
const ecsClient = new client_ecs_1.ECSClient({
    region: process.env.ECS_REGION,
    credentials: {
        accessKeyId: process.env.ECS_ACCESS_KEY_ID,
        secretAccessKey: process.env.ECS_SECRET_ACCESS_KEY,
    },
});
const prisma = new client_1.PrismaClient();
// const io = new Server();
const client = (0, client_2.createClient)({
    host: process.env.CLICKHOUSE_HOST,
    database: process.env.CLICKHOUSE_DATABASE,
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
});
const kafka = new kafkajs_1.Kafka({
    clientId: `kafka-server`,
    brokers: [process.env.KAFKA_BORKER],
    ssl: {
        ca: [fs_1.default.readFileSync(path_1.default.join(__dirname, "kafka_ca.pem"), "utf-8")],
    },
    sasl: {
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
        mechanism: "plain",
    },
});
const logsConsumer = kafka.consumer({ groupId: "api-server-logs-consumer" });
const statusConsumer = kafka.consumer({
    groupId: "api-server-status-consumer",
});
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const safeParse = model_1.signUpSchema.safeParse(req.body);
    console.log(req.body);
    if (!safeParse.success) {
        return res.status(400).json({ message: "Invalide Input" });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email: req.body.email,
            },
        });
        if (user) {
            return res.status(200).json({ message: "User already exists" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
    try {
        yield prisma.user.create({
            data: {
                email: req.body.email,
                password: req.body.password,
            },
        });
        return res.status(200).json({ message: "SignUp Success" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const safeParse = model_1.signUpSchema.safeParse(req.body);
    console.log(req.body);
    if (!safeParse.success) {
        return res.status(400).json({ message: "Invalide Input" });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email: req.body.email,
            },
        });
        if (user) {
            if (req.body.password !== user.password) {
                return res.status(400).json({ message: "Worng Password" });
            }
            else {
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "6h" });
                return res.status(200).json({ user: user, token: token });
            }
        }
        // user not found
        return res.status(400).json({ message: "User not found" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}));
app.get("/projects", jwtTokenVerify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("userId", req.userId);
    const projects = yield prisma.project.findMany({
        where: {
            userId: req.userId,
        },
    });
    // const projects = await prisma.proj.findMany();
    console.log(projects);
    res.status(200).json({ projects: projects });
}));
app.post("/project", jwtTokenVerify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.body;
    const project = yield prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            deployment: {
                orderBy: {
                    updatedAt: "desc",
                },
                take: 1,
            },
        },
    });
    res.status(200).json({ project: project });
}));
app.post("/createProject", jwtTokenVerify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const safeParseResult = model_1.projectInputSchema.safeParse(req.body);
    if (!safeParseResult.success) {
        // @ts-ignore
        return res.status(400).json({ error: safeParseResult.error });
    }
    const { name, gitURL, customdomain } = safeParseResult.data;
    console.log(name);
    const project = yield prisma.project.findUnique({
        where: {
            name: name,
        },
    });
    if (project) {
        return res.status(200).json({ message: `Project ${name} already exists` });
    }
    let projectInitialized = yield prisma.project.create({
        data: {
            name: name,
            gitURL: gitURL,
            subdomain: (0, random_word_slugs_1.generateSlug)(),
            customdomain: customdomain,
            viewers: {
                create: {
                    viewers: 0,
                },
            },
            userId: req.userId,
        },
    });
    return res.status(200).json({ status: "success", data: projectInitialized });
}));
app.get("/logs/:id", jwtTokenVerify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const logsEntry = yield client.query({
        query: `SELECT event_id , deployment_id , log , timestamp  from log_events where deployment_id = { deploymentId:String } ORDER BY timestamp `,
        query_params: {
            deploymentId: id,
        },
        format: "JSONEachRow",
    });
    const rawlogs = yield logsEntry.json();
    return res.status(200).json({ logs: rawlogs });
}));
app.post("/deployment", jwtTokenVerify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deploymentId } = req.body;
    const deployment = yield prisma.deployment.findUnique({
        where: {
            id: deploymentId,
        },
        include: {
            project: true,
        },
    });
    res.status(200).json({ deployment: deployment });
}));
app.post("/deployments", jwtTokenVerify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.body;
    const deployments = yield prisma.deployment.findMany({
        where: {
            project: {
                id: projectId,
                user: {
                    id: req.userId,
                },
            },
        },
    });
    res.status(200).json({ deployments: deployments });
}));
app.get("/status/:id", jwtTokenVerify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const deployment = yield prisma.deployment.findUnique({
        where: {
            id: id,
            project: {
                user: {
                    id: req.userId,
                },
            },
        },
    });
    if (!deployment) {
        return res.status(404).json({ message: "no record found" });
    }
    return res.status(200).json({ status: deployment === null || deployment === void 0 ? void 0 : deployment.status });
}));
app.get("/viewers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const safeParse = model_1.projectIdSchema.safeParse(req.body);
    // @ts-ignore
    if (!safeParse.success) {
        // @ts-ignore
        return res.status(400).json({ error: safeParse.error });
    }
    const { projectId } = safeParse.data;
    const project = yield prisma.viewers.findUnique({
        where: {
            projectId: projectId,
        },
    });
    if (!project) {
        return res.status(400).json({ message: "no such project exists !!" });
    }
    return res.status(200).json({ viewers: project.viewers });
}));
app.post("/deploy", jwtTokenVerify_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.body;
    const project = yield prisma.project.findUnique({
        where: {
            id: projectId,
            user: {
                id: req.userId,
            },
        },
    });
    if (!project) {
        return res.status(400).json({ message: "project not found" });
    }
    // check if it is not already in deployment
    let projectDeployment = yield prisma.deployment.findMany({
        where: { projectId: projectId },
    });
    console.log("postgress");
    console.log(projectDeployment);
    projectDeployment = projectDeployment.filter((p) => p.status === client_1.DeploymentStatus.IN_PROGRESS ||
        p.status === client_1.DeploymentStatus.QUEUED);
    if (projectDeployment.length > 0) {
        return res.status(400).json({ message: "project is already in progess" });
    }
    // postgres
    const deployment = yield prisma.deployment.create({
        data: {
            project: { connect: { id: projectId } },
            status: client_1.DeploymentStatus.QUEUED,
        },
    });
    const command = new client_ecs_1.RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: "FARGATE",
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: "ENABLED",
                subnets: [
                    "subnet-0b377be7fd0a0542a",
                    "subnet-03f9b40870578e8de",
                    "subnet-07998bd79db3611eb",
                ],
                securityGroups: ["sg-0186fb8fdd5bf57e5"],
            },
        },
        overrides: {
            containerOverrides: [
                {
                    name: "builder-image",
                    environment: [
                        {
                            name: "GIT_REPOSITORY_URL",
                            value: project === null || project === void 0 ? void 0 : project.gitURL,
                        },
                        {
                            name: "PROJECT_ID",
                            value: projectId,
                        },
                        {
                            name: "DEPLOYMENT_ID",
                            value: deployment.id,
                        },
                    ],
                },
            ],
        },
    });
    yield ecsClient.send(command);
    return res.json({ status: "queued", data: { deploymentId: deployment.id } });
}));
function initKafkaLogsConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield logsConsumer.connect();
        yield logsConsumer.subscribe({ topics: ["container-logs"] });
        yield logsConsumer.run({
            autoCommit: false,
            eachBatch: ({ batch, resolveOffset, heartbeat, commitOffsetsIfNecessary, }) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const messages = batch.messages;
                console.log(`Received ${messages.length}`);
                for (let message of messages) {
                    const stringMessage = (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString();
                    const { PROJECT_ID, DEPLOYMENT_ID, log } = JSON.parse(stringMessage);
                    console.log(PROJECT_ID, DEPLOYMENT_ID, log);
                    try {
                        const { query_id } = yield client.insert({
                            table: "log_events",
                            values: [{ event_id: (0, uuid_1.v4)(), deployment_id: DEPLOYMENT_ID, log }],
                            format: "JSONEachRow",
                        });
                        console.log(query_id);
                        resolveOffset(message.offset);
                        //@ts-ignore
                        yield commitOffsetsIfNecessary(message.offset);
                        yield heartbeat();
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            }),
        });
    });
}
function initKafkaStatusConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield statusConsumer.connect();
        yield statusConsumer.subscribe({ topics: ["container-status"] });
        yield statusConsumer.run({
            eachMessage: ({ message }) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { PROJECT_ID, DEPLOYMENT_ID, status } = JSON.parse((_a = message.value) === null || _a === void 0 ? void 0 : _a.toString());
                yield prisma.deployment.update({
                    where: {
                        id: DEPLOYMENT_ID,
                    },
                    data: {
                        status: status,
                    },
                });
            }),
        });
    });
}
initKafkaLogsConsumer();
initKafkaStatusConsumer();
app.listen(PORT, () => {
    console.log("listening on port " + PORT);
});
// websocket and redis implementation
// io.on('connection', (socket) => {
//     socket.on('subscribe', (channel) => {
//         socket.join(channel);
//         socket.emit('message', `joined ${channel}`);
//     })
// })
// io.listen(socketPORT);
// async function initRedisSubscribe() {
//     subscriber.psubscribe("log:*");
//     subscriber.on('pmessage', (pattern, channel, message) => {
//         io.to(channel).emit('message', message);
//     })
// }
// initRedisSubscribe();
