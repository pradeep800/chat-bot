import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Navbar from "~/components/navbar";
import CheckAuth from "~/components/checkAuth";
import { Toaster } from "react-hot-toast";
import { useInfo } from "~/utils/userInfoStore";
import { useAuth } from "~/utils/useAuth";
import { Nunito } from "next/font/google";
const nunito = Nunito({ subsets: ["cyrillic"], weight: "variable" });
const MyApp: AppType = ({ Component, pageProps }) => {
  const loading = useInfo((state) => state.loading);
  useAuth();
  /*
   * checking if it is logged in or Not
   */
  if (loading) {
    return (
      <div className="flex h-[90vh] w-[100vw] items-center justify-center">
        Checking Login....
      </div>
    );
  }
  return (
    <div className={`md:m-3 m-1 ${nunito.className} text-lg font-medium`}>
      <Navbar />
      <CheckAuth>
        <Component {...pageProps} />
        <Toaster position="bottom-left" reverseOrder={false} />
      </CheckAuth>
    </div>
  );
};

export default api.withTRPC(MyApp);
