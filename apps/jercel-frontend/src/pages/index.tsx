"use client";
import React from "react";
import { BackgroundBeams } from "../components/ui/background-beams";

export default function Home() {
  return (
    <div className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="mx-auto p-4">
        <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
        Jercel is the Frontend Cloud
        </h1>
        <p></p>
        <p className="text-neutral-500 max-w-xl mx-auto my-2 text-xl text-center relative z-10">
       
           Build, scale, and secure a faster, personalized web.
           Deploy once, deliver everywhere. When you push code to Jercel, we make it instantly available across the planet.
         </p>
       
      </div>
      <BackgroundBeams />
    </div>
  );
}
