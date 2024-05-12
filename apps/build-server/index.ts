import path from "path";
import { exec } from "child_process";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { Kafka } from "kafkajs";

const PROJECT_ID = process.env.PROJECT_ID;
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;

const s3Client = new S3Client({
  region: process.env.ECS_REGION!,
  credentials: {
    accessKeyId: process.env.ECS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ECS_SECRET_ACCESS_KEY!,
  },
});

const kafka = new Kafka({
  clientId: `docker-build-service-${DEPLOYMENT_ID}`,
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

const producer = kafka.producer();

async function publishLog(logs: string) {
  await producer.send({
    topic: "container-logs",
    messages: [
      {
        key: "log",
        value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, log: logs }),
      },
    ],
  });
}

async function publishStatus(status: string) {
  await producer.send({
    topic: "container-status",
    messages: [
      {
        key: "status",
        value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, status: status }),
      },
    ],
  });
}

async function init() {
  await producer.connect();
  // status update

  await publishStatus("IN_PROGRESS");

  console.log("Executing script.js");
  const outDirPath = path.join(__dirname, "output");
  await publishLog("Build Started ...");
  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout?.on("data", async function (data) {
    console.log(data);
    await publishLog(data.toString());
  });

  p.stderr?.on("error", async function (err) {
    console.log(err);
    await publishLog(`error:${err.toString()}`);
    // status update

    await publishStatus("FAILED");
  });

  p.on("close", async function () {
    console.log("Build Complete");
    await publishLog("Build Completed");
    // status update

    await publishStatus("DONE");

    const distFolderPath = path.join(__dirname, "output", "dist");
    const distFolderContent = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    const filesUploadPromise = [];
    for (const filePath of distFolderContent) {
      const file =
        typeof filePath === "string" ? path.join(distFolderPath, filePath) : "";

      if (fs.lstatSync(file).isDirectory()) continue;

      const contentType: string =
        typeof filePath === "string"
          ? mime.lookup(file) || "application/octet-stream"
          : "application/octet-stream";

      const command = new PutObjectCommand({
        Bucket: "jercel",
        Key: `__outputs/${PROJECT_ID}/${filePath}`,
        Body: fs.createReadStream(file),
        ContentType: contentType,
      });
      filesUploadPromise.push(s3Client.send(command));
    }
    await Promise.all(filesUploadPromise).then(async () => {
      console.log("uploaded all files to S3");
      await publishLog("uploaded all files to S3");
    });
    process.exit(0);
  });
}

init();
