import { atom } from "recoil";


export const TerminalContent = atom<string[]>({
    key:"TerminalContent",
    default:[],
})