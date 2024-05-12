


export type DeploymentStatus = "QUEUED" | "NOT_STARTED" | "FAILED" |"DONE" |"IN_PROGRESS";

export  interface TActiveProject {
    id?:string,
    name: string,
    gitURL: string,
    customdomain?:string,
    subdomain?:string,
    createdAt?:string,
    updatedAt?:string,
    deploymentId?:string,
    deploymentStatus?: DeploymentStatus
}