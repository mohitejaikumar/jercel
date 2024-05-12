import { z } from "zod"

export const SignInSchema = z.object({
    Email:z.string().trim().email({message:"Invalid email address"}),
    Password:z.string().trim().max(6,{message:"Please enter 6 character password"}).min(3,{message:"Password should be of min 3 character"})
})
export type SignInType = z.infer<typeof SignInSchema>

export const ProjectSchema = z.object({
    ProjectName:z.string().trim().min(2,{message:"Project Name should be of min 2 character"}),
    GitHubLink:z.string().trim().regex(/^(?:https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.git|git@github\.com:[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.git)$/,{message:"Invalid Github Repository Link"})
})
export type ProjectType = z.infer<typeof ProjectSchema>

export const SignUpSchema = z.object({
    Email:z.string().trim().email({message:"Invalid email address"}),
    Password:z.string().trim().max(6,{message:"Please enter 6 character password"}).min(3,{message:"Password should be of min 3 character"}),
    ConfirmPassword:z.string().trim().max(6,{message:"Please enter 6 character password"}).min(3,{message:"Password should be of min 3 character"})
})
export type SignUpType = z.infer<typeof SignUpSchema>