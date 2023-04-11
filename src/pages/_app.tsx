import { type AppType } from "next/app";

import { api } from "~/utils/api";
import waitingSpunchBob from "~/images/spunchBobWaiting.gif";
import "~/styles/globals.css";
import Navbar from "~/components/navbar";
import CheckAuth from "~/components/checkAuth";
import { Toaster } from "react-hot-toast";
import { useInfo } from "~/utils/userInfoStore";
import { useAuth } from "~/utils/useAuth";
import { Nunito } from "next/font/google";
import Image from "next/image";
import Head from "next/head";
const nunito = Nunito({ subsets: ["cyrillic"], weight: "variable" });
const MyApp: AppType = ({ Component, pageProps }) => {
  const loading = useInfo((state) => state.loading);
  useAuth();
  /*
   * checking if it is logged in or Not
   */
  if (loading) {
    return (
      <div
        className={`flex h-[90%] w-[100vw] flex-col items-center justify-center gap-3 ${nunito.className} text-2xl font-bold`}
      >
        <Image className="p-2" src={waitingSpunchBob} alt="waiting Photo" />
        <div className={``}>Checking Login....</div>
      </div>
    );
  }
  return (
    <div
      className={`mx-1 h-[100%] md:mx-3 ${nunito.className} text-lg font-medium`}
    >
      <Head>
        <title>Chat Application</title>
        <link rel="icon" type="image/x-icon" href="/ai.png"></link>
      </Head>
      <Navbar />
      <CheckAuth>
        <Component {...pageProps} />
        <Toaster position="bottom-left" reverseOrder={false} />
      </CheckAuth>
    </div>
  );
};

export default api.withTRPC(MyApp);
