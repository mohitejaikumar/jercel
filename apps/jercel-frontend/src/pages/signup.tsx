"use client";
import React from "react";

import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";
import { Label } from "jercel/components/ui/label";
import { Input } from "jercel/components/ui/input";
import { cn } from "jercel/utils/cn";
import { BottomGradient } from "jercel/components/ui/formBottomGradient";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SignInSchema,
  SignInType,
  SignUpSchema,
  SignUpType,
} from "../../zod/form";
import { useForm } from "react-hook-form";
import axios from "axios";

export default function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      Email: "",
      Password: "",
      ConfirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpType) => {
    console.log("Form submitted");
    // handle create user
    if (data.Password !== data.ConfirmPassword) {
      setError("ConfirmPassword", {
        message: "Confirm password doesnot match password",
      });
    } else {
      console.log(data);

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/signup`,
          {
            email: data.Email,
            password: data.Password,
          }
        );
        console.log(res);
      } catch (err) {
        console.error(err);
      }

      //   router.push("/api/auth/signin");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Welcome to Jercel
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Deploy your React-Vite project on just one Click .
      </p>

      <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="mohitejaikumar@gmail.com"
            type="email"
            {...register("Email", { required: true })}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            {...register("Password", { required: true })}
          />
        </LabelInputContainer>
        {errors.ConfirmPassword && (
          <p role="alert" className="text-red-500">
            {errors.ConfirmPassword.message}
          </p>
        )}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            placeholder="••••••••"
            type="password"
            {...register("ConfirmPassword", { required: true })}
          />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit">
          Sign Up &rarr;
          <BottomGradient />
        </button>
      </form>
      <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

      <div className="flex flex-col space-y-4">
        <button
          className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
          type="submit">
          <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
          <span className="text-neutral-700 dark:text-neutral-300 text-sm">
            GitHub
          </span>
          <BottomGradient />
        </button>
        <button
          className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
          type="submit">
          <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
          <span className="text-neutral-700 dark:text-neutral-300 text-sm">
            Google
          </span>
          <BottomGradient />
        </button>
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
