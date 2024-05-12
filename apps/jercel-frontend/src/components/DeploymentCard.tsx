import stringTotime from "jercel/helper/stringTotime";
import { useRouter } from "next/router";
import React from "react";

interface DeploymentProps {
  deploymentId: string;
  status: string;
  createdAt: string;
}

export const DeploymentCard = (props: DeploymentProps) => {
  const router = useRouter();
  const { hours, minutes, seconds } = stringTotime(props.createdAt);

  return (
    <React.Fragment>
      <div className=" w-[400px] h-[200px] py-5 px-5  m-2 break-words border-2 border-gray-800 hover:border-white rounded-md cursor-pointer ">
        <div className="mt-5  flex justify-between items-center">
          <div>
            <div className="text-gray-400">DeploymentId</div>
            <div className="mt-1">{props.deploymentId}</div>
          </div>
          <div>
            <div className=" text-gray-400">Status</div>
            <div className="mt-1">{props.status}</div>
          </div>
        </div>
        <div className="mt-5  flex justify-between items-center">
          <div>
            <div className=" text-gray-400">CreatedAt</div>
            <div className="mt-1">
              {hours
                ? hours + " hrs"
                : minutes
                  ? minutes + " min"
                  : seconds + " sec"}{" "}
              ago{" "}
            </div>
          </div>
          <button
            className="bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md px-3 py-1 text-md font-semibold"
            onClick={() => {
              router.push(
                `/projects/${router.query.projectId}/${props.deploymentId}`
              );
            }}>
            Logs
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};
