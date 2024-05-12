import { atom } from "recoil";
import {TActiveProject} from "../../types/project";


export const ActiveProject = atom<TActiveProject | null>({
    key: 'ActiveProject',
    default: null
});