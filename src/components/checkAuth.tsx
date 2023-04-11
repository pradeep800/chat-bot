import { useInfo } from "~/utils/userInfoStore";

export default function CheckAuth({ children }: { children: React.ReactNode }) {
  const userInfo = useInfo((state) => state.userInfo);

  return (
    <>
      {userInfo.email ? (
        <>{children}</>
      ) : (
        <div className=" flex h-[80vh] flex-col items-center justify-center gap-4 text-center font-extrabold">
          <h1 className=" bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-4xl text-transparent">
            Welcome To Our Chat Application
          </h1>
          <div className="text-bold ">
            Login Icon Is In Nav Bar You Have To Login With Google For Using
            This Application
          </div>
        </div>
      )}
    </>
  );
}
