import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { projectIdSchema, projectInputSchema, signUpSchema } from "./zod/model";
import {
  DeploymentStatus,
  PrismaClient,
} from "../../node_modules/.prisma/client";
import { createClient } from "@clickhouse/client"; // or '@clickhouse/client-web'
import path from "path";
import fs from "fs";
import cors from "cors";
import { v4 } from "uuid";
import { Kafka } from "kafkajs";
import jwt from "jsonwebtoken";
import CustomRequest from "./customInterface/customRequest";
import verifyToken from "./middlewares/jwtTokenVerify";

// import { Server } from 'socket.io';

const app = express();
const PORT = 3000;
// const socketPORT = 3001;

app.use(express.json());
app.use(cors());

const config = {
  CLUSTER: process.env.AWS_CLUSTER,
  TASK: process.env.AWS_TASK,
};
const ecsClient = new ECSClient({
  region: process.env.ECS_REGION!,
  credentials: {
    accessKeyId: process.env.ECS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ECS_SECRET_ACCESS_KEY!,
  },
});
const prisma = new PrismaClient();
// const io = new Server();

const client = createClient({
  host: process.env.CLICKHOUSE_HOST,
  database: process.env.CLICKHOUSE_DATABASE,
  username: process.env.CLICKHOUSE_USERNAME,
  password: process.env.CLICKHOUSE_PASSWORD,
});

const kafka = new Kafka({
  clientId: `kafka-server`,
  brokers: [process.env.KAFKA_BORKER!],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, "kafka_ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
    mechanism: "plain",
  },
});

const logsConsumer = kafka.consumer({ groupId: "api-server-logs-consumer" });
const statusConsumer = kafka.consumer({
  groupId: "api-server-status-consumer",
});

app.post("/signup", async (req: CustomRequest, res) => {
  const safeParse = signUpSchema.safeParse(req.body);
  console.log(req.body);
  if (!safeParse.success) {
    return res.status(400).json({ message: "Invalide Input" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (user) {
      return res.status(200).json({ message: "User already exists" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
  try {
    await prisma.user.create({
      data: {
        email: req.body.email,
        password: req.body.password,
      },
    });
    return res.status(200).json({ message: "SignUp Success" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
});
app.post("/signin", async (req: CustomRequest, res) => {
  const safeParse = signUpSchema.safeParse(req.body);
  console.log(req.body);
  if (!safeParse.success) {
    return res.status(400).json({ message: "Invalide Input" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (user) {
      if (req.body.password !== user.password) {
        return res.status(400).json({ message: "Worng Password" });
      } else {
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET as string,
          { expiresIn: "6h" }
        );
        return res.status(200).json({ user: user, token: token });
      }
    }
    // user not found
    return res.status(400).json({ message: "User not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
app.get("/projects", verifyToken, async (req: CustomRequest, res) => {
  console.log("userId", req.userId);
  const projects = await prisma.project.findMany({
    where: {
      userId: req.userId,
    },
  });
  // const projects = await prisma.proj.findMany();

  console.log(projects);
  res.status(200).json({ projects: projects });
});
app.post("/project", verifyToken, async (req: CustomRequest, res) => {
  const { projectId } = req.body;
  const project = await prisma.project.findUnique({
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
});
app.post("/createProject", verifyToken, async (req: CustomRequest, res) => {
  const safeParseResult = projectInputSchema.safeParse(req.body);

  if (!safeParseResult.success) {
    // @ts-ignore
    return res.status(400).json({ error: safeParseResult.error });
  }

  const { name, gitURL, customdomain } = safeParseResult.data;
  console.log(name);
  const project = await prisma.project.findUnique({
    where: {
      name: name,
    },
  });
  if (project) {
    return res.status(200).json({ message: `Project ${name} already exists` });
  }

  let projectInitialized = await prisma.project.create({
    data: {
      name: name,
      gitURL: gitURL,
      subdomain: generateSlug(),
      customdomain: customdomain,
      viewers: {
        create: {
          viewers: 0,
        },
      },
      userId: req.userId as string,
    },
  });

  return res.status(200).json({ status: "success", data: projectInitialized });
});

app.get("/logs/:id", verifyToken, async (req: CustomRequest, res) => {
  const { id } = req.params;

  const logsEntry = await client.query({
    query: `SELECT event_id , deployment_id , log , timestamp  from log_events where deployment_id = { deploymentId:String } ORDER BY timestamp `,
    query_params: {
      deploymentId: id,
    },
    format: "JSONEachRow",
  });

  const rawlogs: [] = await logsEntry.json();

  return res.status(200).json({ logs: rawlogs });
});

app.post("/deployment", verifyToken, async (req: CustomRequest, res) => {
  const { deploymentId } = req.body;

  const deployment = await prisma.deployment.findUnique({
    where: {
      id: deploymentId,
    },
    include: {
      project: true,
    },
  });

  res.status(200).json({ deployment: deployment });
});
app.post("/deployments", verifyToken, async (req: CustomRequest, res) => {
  const { projectId } = req.body;
  const deployments = await prisma.deployment.findMany({
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
});

app.get("/status/:id", verifyToken, async (req: CustomRequest, res) => {
  const id = req.params.id;

  const deployment = await prisma.deployment.findUnique({
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
  return res.status(200).json({ status: deployment?.status });
});

app.get("/viewers", async (req: CustomRequest, res) => {
  const safeParse = projectIdSchema.safeParse(req.body);
  // @ts-ignore
  if (!safeParse.success) {
    // @ts-ignore
    return res.status(400).json({ error: safeParse.error });
  }
  const { projectId } = safeParse.data;

  const project = await prisma.viewers.findUnique({
    where: {
      projectId: projectId,
    },
  });
  if (!project) {
    return res.status(400).json({ message: "no such project exists !!" });
  }
  return res.status(200).json({ viewers: project.viewers });
});

app.post("/deploy", verifyToken, async (req: CustomRequest, res) => {
  const { projectId } = req.body;

  const project = await prisma.project.findUnique({
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

  let projectDeployment = await prisma.deployment.findMany({
    where: { projectId: projectId },
  });
  console.log("postgress");
  console.log(projectDeployment);
  projectDeployment = projectDeployment.filter(
    (p) =>
      p.status === DeploymentStatus.IN_PROGRESS ||
      p.status === DeploymentStatus.QUEUED
  );

  if (projectDeployment.length > 0) {
    return res.status(400).json({ message: "project is already in progess" });
  }
  // postgres
  const deployment = await prisma.deployment.create({
    data: {
      project: { connect: { id: projectId } },
      status: DeploymentStatus.QUEUED,
    },
  });

  const command = new RunTaskCommand({
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
              value: project?.gitURL,
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

  await ecsClient.send(command);

  return res.json({ status: "queued", data: { deploymentId: deployment.id } });
});

async function initKafkaLogsConsumer() {
  await logsConsumer.connect();
  await logsConsumer.subscribe({ topics: ["container-logs"] });
  await logsConsumer.run({
    autoCommit: false,
    eachBatch: async ({
      batch,
      resolveOffset,
      heartbeat,
      commitOffsetsIfNecessary,
    }) => {
      const messages = batch.messages;
      console.log(`Received ${messages.length}`);
      for (let message of messages) {
        const stringMessage = message.value?.toString();

        const { PROJECT_ID, DEPLOYMENT_ID, log } = JSON.parse(stringMessage!!);
        console.log(PROJECT_ID, DEPLOYMENT_ID, log);
        try {
          const { query_id } = await client.insert({
            table: "log_events",
            values: [{ event_id: v4(), deployment_id: DEPLOYMENT_ID, log }],
            format: "JSONEachRow",
          });
          console.log(query_id);
          resolveOffset(message.offset);
          //@ts-ignore
          await commitOffsetsIfNecessary(message.offset);
          await heartbeat();
        } catch (err) {
          console.log(err);
        }
      }
    },
  });
}
async function initKafkaStatusConsumer() {
  await statusConsumer.connect();
  await statusConsumer.subscribe({ topics: ["container-status"] });
  await statusConsumer.run({
    eachMessage: async ({ message }) => {
      const { PROJECT_ID, DEPLOYMENT_ID, status } = JSON.parse(
        message.value?.toString()!!
      );

      await prisma.deployment.update({
        where: {
          id: DEPLOYMENT_ID,
        },
        data: {
          status: status,
        },
      });
    },
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
