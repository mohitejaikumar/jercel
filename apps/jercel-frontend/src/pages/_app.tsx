import Appbar from "jercel/components/Appbar";
import Loading from "jercel/components/Loading";
import "jercel/styles/globals.css";
import { NextComponentType } from "next";
import { SessionProvider, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import React, { ReactNode } from "react";
import { RecoilRoot } from "recoil";


type CustomAppProps = AppProps & {
  Component: NextComponentType & { auth?: boolean } // add auth type
}

interface Props {
  children?: ReactNode
}


export default function App({ Component, pageProps, router }: CustomAppProps) {

  return (
    <App2 pageProps={pageProps} Component={Component} router={router} />
  )
}

function App2({ Component, pageProps }: CustomAppProps) {

  return (
    <RecoilRoot>
      <SessionProvider session={pageProps.session}>
        <Appbar></Appbar>

        {Component.auth ? (
          <Auth>
            <Component {...pageProps} />
          </Auth>
        ) : (
          <Component {...pageProps} />
        )}

      </SessionProvider>
    </RecoilRoot>
  )
}

function Auth({ children }: Props) {
  // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const { status } = useSession({ required: true })

  if (status === "loading") {
    return (

      <Loading></Loading>

    )
  }

  return children
}