import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Navbar from "~/components/navbar";
import CheckAuth from "~/components/checkAuth";
import { Toaster } from "react-hot-toast";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className="m-1 md:m-3">
      <Navbar />
      <CheckAuth>
        <Component {...pageProps} />
        <Toaster position="bottom-left" reverseOrder={false} />
      </CheckAuth>
    </div>
  );
};

export default api.withTRPC(MyApp);
