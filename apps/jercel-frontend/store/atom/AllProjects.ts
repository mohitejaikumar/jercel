import { atom } from "recoil";
import {TActiveProject} from "../../types/project";


export const AllProjects = atom<TActiveProject[] | null>({
  key: 'TodoList',
  default: null,
});