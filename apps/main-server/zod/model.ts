import { z } from "zod";

const GitUrlRegex =
  /^(?:https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.git|git@github\.com:[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.git)$/;

export const projectInputSchema = z.object({
  name: z.string(),
  gitURL: z.string().refine((val) => GitUrlRegex.test(val), {
    message: "Invalid Git URL",
  }),
  customdomain: z.optional(z.string()),
});

export const projectIdSchema = z.object({
  projectId: z.string(),
});

export const signUpSchema = z.object({
  email: z.string(),
  password: z.string(),
});
