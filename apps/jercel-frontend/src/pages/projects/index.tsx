import axios from "axios";
import ProjectCard from "jercel/components/ProjectCard";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { authOptions } from "../api/auth/[...nextauth]";

export default function AllProjects(props) {
  const router = useRouter();
  const projects = props.projects;

  async function onDeploy(projectId: string, projectName: string) {
    console.log(projectId);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/deploy`,
      {
        projectId,
      },
      {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      }
    );
    console.log(res.data);
    const deploymentId = res.data.data.deploymentId;

    router.push(`/projects/${projectName}/${deploymentId}`);
  }

  console.log(props);

  return (
    <React.Fragment>
      <div className="border-b-2 mt-10 border-gray-800"></div>
      <div className="flex justify-end">
        <button
          className="mr-3 sm:mr-20 mt-5 bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md px-3 py-1 text-lg font-semibold"
          onClick={() => {
            router.push(`/projects/create`);
          }}>
          {" "}
          + Create Project
        </button>
      </div>
      <div className="flex flex-wrap px-2  mt-3">
        {projects.map((project) => {
          return (
            <ProjectCard
              projectName={project.name}
              gitURL={project.gitURL}
              createdAt={project.createdAt}
              projectId={project.id}
              onDeploy={onDeploy}
              key={project.id}
            />
          );
        })}
      </div>
    </React.Fragment>
  );
}

AllProjects.auth = true;

export async function getServerSideProps(context) {
  const { user } = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const res = await axios.get("http://localhost:3000/projects", {
    headers: {
      Authorization: `Bearer ${user.jwtToken}`,
    },
  });

  console.log(res.data);
  return {
    props: {
      projects: res.data.projects,
      token: user.jwtToken,
    },
  };
}

// const projects = [
//   {
//     "projectName": "Website Redesign",
//     "gitURL": "https://github.com/mohitejaikumar/website-redesign.git",
//     "createdTime": "2023-07-15T08:30:00Z",
//     "projectId": "fubero9gubeoribngiovneriognvio",
//   },
//   {
//     "projectName": "Mobile App Development",
//     "gitURL": "https://github.com/mohitejaikumar/mobile-app-development.git",
//     "createdTime": "2023-08-20T10:15:00Z",
//     "projectId": "fubero9gubeoribngiovneriognvio",
//   },
//   {
//     "projectName": "Data Analysis Platform",
//     "gitURL": "https://github.com/mohitejaikumar/data-analysis-platform.git",
//     "createdTime": "2023-09-25T14:45:00Z",
//     "projectId": "fubero9gubeoribngiovneriognvio",
//   },
//   {
//     "projectName": "E-commerce Website",
//     "gitURL": "https://github.com/mohitejaikumar/e-commerce-website.git",
//     "createdTime": "2023-10-10T11:00:00Z",
//     "projectId": "fubero9gubeoribngiovneriognvio",
//   },
//   {
//     "projectName": "Customer Relationship Management",
//     "gitURL": "https://github.com/mohitejaikumar/crm.git",
//     "createdTime": "2023-11-05T09:30:00Z",
//     "projectId": "fubero9gubeoribngiovneriognvio",
//   },
//   {
//     "projectName": "Chat Application",
//     "gitURL": "https://github.com/mohitejaikumar/chat-application.git",
//     "createdTime": "2023-12-15T16:20:00Z",
//     "projectId": "fubero9gubeoribngiovneriognvio",
//   },
//   {
//     "projectName": "Task Management Tool",
//     "gitURL": "https://github.com/mohitejaikumar/task-management.git",
//     "createdTime": "2024-01-20T13:45:00Z",
//     "projectId": "fubero9gubeoribngiovneriognvio",
//   }
// ]
