import { selector } from "recoil";
import { ActiveProject } from "../atom/ActiveProject";


export const deploymentStatus = selector({
    key: 'deploymentStatus',
    get: ({ get }) => {
        const project = get(ActiveProject);
        return project?.deploymentStatus;
    },

});