import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function Appbar() {
  const { data: session } = useSession();
  const router = useRouter();

  async function SignOut() {
    await signOut();
    console.log("logout successful !!");
  }

  return (
    <React.Fragment>
      <div className=" h-8 flex justify-between mt-3 mb-3 sm:mx-10 ">
        <div
          className=" ml-5 h-6 w-10 text-[1.5rem] font-semibold cursor-pointer"
          onClick={() => {
            router.push("/");
          }}>
          Jercel
        </div>
        {!session && (
          <div className="flex justify-between gap-4 mr-3 md:mr-5">
            <button
              className="hover:bg-[#2b2929] border-solid border-[0.01rem] border-gray-700  px-3 py-1 rounded-md text-sm "
              onClick={() => signIn()}>
              Log In
            </button>
            <button
              className="bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md px-3 py-0 text-sm font-semibold"
              onClick={() => router.push("/signup")}>
              Sign Up
            </button>
          </div>
        )}
        {session && (
          <div className="flex justify-between gap-4 mr-3 md:mr-5">
            <button
              className="hover:bg-[#2b2929] border-solid border-[0.01rem] border-gray-700  px-3 py-1 rounded-md text-sm "
              onClick={() => {
                router.push("/projects");
              }}>
              Projects
            </button>
            <button
              className="button bg-[#ededed] hover:bg-[#d2cece] text-black rounded-md px-3 py-1 text-sm font-semibold  mr-2 sm:mr-5"
              onClick={() => {
                SignOut();
              }}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
