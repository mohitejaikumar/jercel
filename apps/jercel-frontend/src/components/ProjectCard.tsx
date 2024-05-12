import stringTotime from "jercel/helper/stringTotime";
import { useRouter } from "next/router";

import React from "react";
import { FaGithub } from "react-icons/fa";

export default function ProjectCard(props: {
  projectName: string;
  gitURL: string;
  createdAt: string;
  projectId: string;
  onDeploy: (projectId: string, projectName: string) => void;
  key: string;
}) {
  const router = useRouter();
  const gitURL = props.gitURL.slice(19, props.gitURL.length - 4);

  const { hours, minutes, seconds } = stringTotime(props.createdAt);

  return (
    <React.Fragment>
      <div className="card w-[350px] h-[130px] py-5 pl-3 m-2 break-words border-2 border-gray-800 hover:border-white rounded-md cursor-pointer">
        <div className=" font-serif text-xl">{props.projectName}</div>
        <div className=" mt-2 flex items-center">
          <FaGithub />
          <div className="pl-1 hover:underline break-words">{gitURL}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-gray-400 font-semibold mt-2 break-words pl-2">
            {hours
              ? hours + " hrs"
              : minutes
                ? minutes + " min"
                : seconds + " sec"}{" "}
            ago{" "}
          </div>
          <div>
            <button
              className="mr-2 mt-2 bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md px-3 py-1 text-sm font-semibold"
              onClick={() => {
                props.onDeploy(props.projectId, props.projectName);
              }}>
              Deploy
            </button>
            <button
              className="mr-3 mt-2 bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md px-3 py-1 text-sm font-semibold"
              onClick={() => {
                router.push(`/projects/${props.projectId}`);
              }}>
              View
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
