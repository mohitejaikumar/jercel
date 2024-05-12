import stringTotime from "jercel/helper/stringTotime";
import { useRouter } from "next/router";
import React from "react";
import Iframe from "react-iframe";

export interface ProjectDetails {
  latestDeploymentId: string;
  domain: string;
  status: string;
  createdAt: string;
  lastUpdatedAt: string;
  gitURL: string;
}

export default function ProjectDisplayCard(props: ProjectDetails) {
  const router = useRouter();
  const { hours, minutes, seconds } = stringTotime(props.createdAt);

  return (
    <React.Fragment>
      <div className="w-full h-full flex">
        <Iframe
          url={props.domain}
          width={"40%"}
          className="rounded-md"
          allowFullScreen
          overflow="hidden"
        />
        <div className="ml-10">
          <div className=" text-gray-400">Latest DeploymentId</div>
          <a
            className="mt-1 hover:underline hover:cursor-pointer"
            onClick={() => {
              router.push(
                `/projects/${router.query.projectId}/${props.latestDeploymentId}`
              );
            }}>
            {props.latestDeploymentId}
          </a>
          <div className="mt-5 text-gray-400">Domain</div>
          <a
            className="mt-1 hover:underline hover:cursor-pointer"
            href={props.domain}>
            {props.domain}
          </a>
          <div className="mt-5 flex">
            <div>
              <div className="text-gray-400">Status</div>
              <div className="mt-1">{props.status}</div>
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
            className="mt-1 hover:underline hover:cursor-pointer"
            href={props.gitURL}>
            {props.gitURL}
          </a>
        </div>
      </div>
    </React.Fragment>
  );
}
