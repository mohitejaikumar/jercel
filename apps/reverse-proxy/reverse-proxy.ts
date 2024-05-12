import express from "express";
import httpProxy from "http-proxy";
import {
  DeploymentStatus,
  PrismaClient,
} from "../../node_modules/.prisma/client";

const prisma = new PrismaClient();
const PORT = 8000;
const app = express();

const BASE_URL = `https://jercel.s3.ap-south-1.amazonaws.com/__outputs`;

const proxy = httpProxy.createProxy();

async function incrementViewers(projectId: string) {
  await prisma.viewers.update({
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
}
app.use(async (req, res) => {
  const host = req.hostname;
  const slug = host.split(".")[0];
  // console.log(slug);
  const project = await prisma.project.findUnique({
    where: {
      subdomain: slug,
    },
  });
  console.log(project);
  // if (project) {
  //     incrementViewers(project.id);
  // }
  const resolvesTo = `${BASE_URL}/${project?.id}`;
  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

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
