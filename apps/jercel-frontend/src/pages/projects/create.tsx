import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

import axios from "axios";
import { useSetRecoilState } from "recoil";

import { useRouter } from "next/router";
import { ActiveProject } from "../../../store/atom/ActiveProject";
import { ProjectSchema, ProjectType } from "../../../zod/form";
import { TActiveProject } from "../../../types/project";
import { useSession } from "next-auth/react";

export default function ProjectInit() {
  const router = useRouter();
  const setActiveProject = useSetRecoilState(ActiveProject);
  const session: any = useSession();
  const token = session?.data?.user?.jwtToken;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProjectType>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      ProjectName: "",
      GitHubLink: "",
    },
  });
  console.log(token);

  async function onSubmit(data: ProjectType) {
    console.log(data);
    const projectDetails = {
      name: data.ProjectName,
      gitURL: data.GitHubLink,
    };
    console.log(projectDetails);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/createProject`,
        projectDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const project: TActiveProject = res.data.data;
      console.log(res.data);
      setActiveProject(project);
    } catch (err) {
      console.log("AxiosError", err);
    }
  }

  return (
    <React.Fragment>
      <div className="project_car flex justify-center items-center  w-full h-full">
        <div
          id="signin-card"
          className=" mt-48 border-solid flex flex-col w-auto py-6 px-7 border-[0.01rem] rounded-lg text-center">
          <h5 className="font-semibold text-2xl">Create Project</h5>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col space-y-3 mt-3">
            {errors.ProjectName && (
              <p role="alert" className="text-red-500">
                {errors.ProjectName.message}
              </p>
            )}
            <input
              className="w-72 md:w-96 h-10 rounded-md bg-gray-700 px-1"
              placeholder="Project Name"
              {...register("ProjectName")}
            />
            {errors.GitHubLink && (
              <p role="alert" className="text-red-500">
                {errors.GitHubLink.message}
              </p>
            )}
            <input
              className=" w-72 md:w-96 h-10 rounded-md  bg-gray-700 px-1"
              placeholder="Github Repository Link"
              {...register("GitHubLink")}
            />

            <button
              type="submit"
              className="bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md px-3  py-2 text-lg font-semibold"
              onClick={() => {
                console.log("hi");
              }}>
              Create
            </button>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
}

ProjectInit.auth = true;
