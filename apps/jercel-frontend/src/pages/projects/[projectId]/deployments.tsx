import axios from "axios";
import { DeploymentCard } from "jercel/components/DeploymentCard";
import { authOptions } from "jercel/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import React from "react";

export default function Deployments(props) {
  const router = useRouter();
  console.log(props);

  const deployments = props.deployments;

  return (
    <React.Fragment>
      <div className="border-b-2 mt-10 border-gray-800"></div>
      <div className=" 2xl:px-24 flex flex-wrap  mt-11">
        {deployments.map((project) => {
          return (
            <DeploymentCard
              deploymentId={project.id}
              createdAt={project.createdAt}
              status={project.status}
            />
          );
        })}
      </div>
    </React.Fragment>
  );
}

Deployments.auth = true;

export async function getServerSideProps(context) {
  const { projectId } = context.query;
  const { user } = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/deployments`,
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
      deployments: res.data.deployments,
    },
  };
}
