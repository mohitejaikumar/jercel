import axios from "axios";
import ProjectDisplayCard from "jercel/components/ProjectDisplayCard";
import { useRouter } from "next/router";
import React from "react";
import prisma from "../../../../prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "jercel/pages/api/auth/[...nextauth]";

export default function ProjectDetails(props) {
  const router = useRouter();
  console.log(props);
  const projectId = router.query.projectId;
  const project = props.project;
  if (props.project.deployment.length === 0) {
    return (
      <>
        <div>Please deploy first to view it</div>
      </>
    );
  }
  return (
    <React.Fragment>
      <div className="border-b-2 mt-10 border-gray-800"></div>
      <div className=" flex h-[120px] justify-around items-center border-b-2  border-gray-800">
        <div className=" text-4xl font-sans font-semibold">{project.name}</div>
        <div className=" flex gap-5">
          <button
            className=" hover:bg-[#2b2929] border-solid border-2 border-gray-700 px-6 py-2 rounded-md text-lg font-semibold"
            onClick={() => {
              router.push(`/projects/${projectId}/deployments`);
            }}>
            Deployments
          </button>
          <button
            className=" bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md px-4  text-lg"
            onClick={() => {
              window.open(
                `http://${project.subdomain}.${process.env.NEXT_PUBLIC_REVERSE_PROXY_URL}`,
                "_blank"
              );
            }}>
            View
          </button>
        </div>
      </div>
      <div className="mx-52 h-[400px] mt-10 border-2 border-gray-800 p-8 rounded-xl">
        <ProjectDisplayCard
          latestDeploymentId={project.deployment[0].id}
          domain={`http://${project.subdomain}.${process.env.NEXT_PUBLIC_REVERSE_PROXY_URL}`}
          status={project.deployment[0].status}
          createdAt={project.deployment[0].createdAt}
          lastUpdatedAt={project.deployment[0].updatedAt}
          gitURL={project.gitURL}
        />
      </div>
    </React.Fragment>
  );
}
ProjectDetails.auth = true;

export async function getServerSideProps(context) {
  const { projectId } = context.query;
  const { user } = await getServerSession(
    context.req,
    context.res,
    authOptions
  );
  // project details
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

  return {
    props: {
      project: res1.data.project,
      token: user.jwtToken,
    },
  };
}
