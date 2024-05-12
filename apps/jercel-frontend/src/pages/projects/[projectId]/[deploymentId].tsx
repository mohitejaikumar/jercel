import axios from "axios";
import TerminalCard from "jercel/components/Terminal";
import stringTotime from "jercel/helper/stringTotime";
import { useRouter } from "next/router";
import { DeploymentStatus } from "@repo/prisma";
import React, { useEffect, useState } from "react";
import { clearTimeout } from "timers";
import { authOptions } from "jercel/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "../../../../prisma";

export default function DeploymentId(props) {
  const router = useRouter();

  const [terminalContent, setTerminalContent] = useState<string[]>([
    "Wait for Logs...",
  ]);
  const [status, setStatus] = useState<DeploymentStatus>(
    DeploymentStatus.QUEUED
  );
  const { projectName, deploymentId } = router.query;
  const { hours, minutes, seconds } = stringTotime(props.deployment.createdAt);
  const gitURL = props.deployment.project.gitURL;

  useEffect(() => {
    const getLogs = async (currentStatus: DeploymentStatus) => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/logs/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        }
      );
      console.log(res.data.logs);
      const resLogs = res.data.logs.map((l) => l.log);
      if (resLogs.length > 0) {
        setTerminalContent(resLogs);
      } else {
        setTerminalContent(["Wait for Logs.."]);
      }
      console.log("jai status", status);

      if (
        currentStatus === DeploymentStatus.DONE ||
        currentStatus === DeploymentStatus.FAILED
      ) {
        console.log(
          "hi stoping calling................................................................"
        );
        return () => {
          clearTimeout(timeout);
        };
      }
      const resStatus = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/status/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        }
      );
      console.log(resStatus.data.status);
      setStatus(resStatus.data.status);

      const timeout = setTimeout(() => {
        getLogs(resStatus.data.status);
      }, 5000);
    };

    getLogs(status);
  }, []);

  return (
    <React.Fragment>
      <div className="border-b-2 mt-10 border-gray-800"></div>
      <div className=" flex h-[120px] justify-around items-center border-b-2  border-gray-800">
        <div className=" text-4xl font-sans font-semibold">{projectName}</div>
      </div>
      <div className="flex  mx-32  mt-5 border-2 rounded-xl border-gray-800">
        <TerminalCard terminalContent={terminalContent} />
        <div className="ml-6">
          <div className="mt-10 flex">
            <div>
              <div className="text-gray-400">Status</div>
              <div className="mt-1">{status}</div>
            </div>
            <div className="ml-8">
              <div className="text-gray-400">CreatedAt</div>
              <div className="mt-1">
                {hours
                  ? hours + " hrs"
                  : minutes
                    ? minutes + " min"
                    : seconds + " sec"}{" "}
                ago{" "}
              </div>
            </div>
          </div>
          <div className="mt-5 text-gray-400">GitURL</div>
          <a
            className="mt-1 hover:underline hover:cursor-pointer block"
            href={`${gitURL}`}>
            {gitURL}
          </a>
          <button
            className="bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md mt-5 px-10 py-2 text-sm font-semibold"
            onClick={() => {
              window.open(
                `http://${props.project.subdomain}.${process.env.NEXT_PUBLIC_REVERSE_PROXY_URL}`,
                "_blank"
              );
            }}>
            Visit
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

export async function getServerSideProps(context) {
  const { deploymentId, projectId } = context.query;
  const { user } = await getServerSession(
    context.req,
    context.res,
    authOptions
  );
  console.log(projectId);
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/deployment`,
    {
      deploymentId: deploymentId,
    },
    {
      headers: {
        Authorization: `Bearer ${user.jwtToken}`,
      },
    }
  );
  const res1 = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/project`,
    {
      projectId: projectId,
    },
    {
      headers: {
        Authorization: `Bearer ${user.jwtToken}`,
      },
    }
  );

  console.log(res1.data.project);
  return {
    props: {
      deployment: res.data.deployment,
      project: res1.data.project,
      token: user.jwtToken,
    },
  };
}
