import { selector } from "recoil";
import { ActiveProject } from "../atom/ActiveProject";


export const activeProjectId = selector({
    key: 'activeProjectId',
    get: ({ get }) => {
        const project = get(ActiveProject);
        return project?.id;
    },

});