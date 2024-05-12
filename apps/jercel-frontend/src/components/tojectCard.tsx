import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ActiveProject } from "../../store/atom/ActiveProject";
import axios from "axios";



export default function ProjectDetails() {

    const [project, setProject] = useRecoilState(ActiveProject);

    const [customdomain, setCustomdomain] = useState("");
    async function onSubmit() {

        try {
            const res = await axios.post('http://localhost:3000/deploy',
             { projectId: "1b7718d5-fb71-4fed-8603-f4caac12f420" })
             console.log(res);
            const deploymentId: string = res.data.data.deploymentId;
            if (project) {
                setProject({ ...project, deploymentId });
            }

        }
        catch (err) {
            console.log(err);
        }
    }
   console.log(project);


    return (
        <React.Fragment>
            <div className=" bg-gray-800 rounded-lg shadow-lg p-6 w-[500px]">
                <h2 className="text-2xl font-bold mb-4 text-gray-200">Project Details</h2>

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2" >Project Name:</label>
                    <input className="bg-gray-700 focus:outline-none focus:shadow-outline border border-gray-600 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" id="projectName" type="text" value={project?.name || ""} readOnly />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">GitHub URL:</label>
                    <input className="bg-gray-700 focus:outline-none focus:shadow-outline border border-gray-600 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" id="githubUrl" type="text"
                        value={project?.gitURL || ""} readOnly />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Custom Domain:</label>
                    <input className="bg-gray-700 focus:outline-none focus:shadow-outline border border-gray-600 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" id="customDomain" type="text" placeholder="Enter custom domain" />
                </div>

                <button className="bg-[#ededed] hover:bg-[#d2cece] text-black font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={onSubmit}>
                    Deploy
                </button>

            </div>
        </React.Fragment>
    )
}