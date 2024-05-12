import { zodResolver } from "@hookform/resolvers/zod";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken, signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { SignInType, SignInSchema } from "../../../zod/form";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Label } from "jercel/components/ui/label";
import { Input } from "jercel/components/ui/input";
import { BottomGradient } from "jercel/components/ui/formBottomGradient";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { cn } from "jercel/utils/cn";

export default function SignInForm(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      Email: "",
      Password: "",
    },
  });

  async function onSubmit(data) {
    console.log(data);
    console.log("hi from submit");

    // passes csrfToken
    data.csrfToken = props.csrfToken;
    const rest = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    //         // checks if it is valid user
    if (!rest?.ok) {
      setError("Password", { message: "Wrong Password" });
      console.log("error");
      console.log(rest);
    } else {
      router.replace("/");
    }
  }

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
          {errors.Email && (
            <p role="alert" className="text-red-500">
              {errors.Email.message}
            </p>
          )}
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="mohitejaikumar@gmail.com"
            type="email"
            {...register("Email", { required: true })}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          {errors.Password && (
            <p role="alert" className="text-red-500">
              {errors.Password.message}
            </p>
          )}
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            {...register("Password", { required: true })}
          />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit">
          Sign In &rarr;
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let csrf: string | null | undefined = await getCsrfToken(context);
  if (csrf === undefined) {
    csrf = null;
  }
  return {
    props: {
      csrfToken: csrf,
    },
  };
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
