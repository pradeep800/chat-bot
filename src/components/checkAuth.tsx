import { useInfo } from "~/utils/userInfoStore";

export default function CheckAuth({ children }: { children: React.ReactNode }) {
  const userInfo = useInfo((state) => state.userInfo);

  return (
    <>
      {userInfo.email ? (
        <>{children}</>
      ) : (
        <div className="flex h-[90vh] items-center justify-center text-lg font-bold text-blue-500  ">
          Please Login Before Using This App
        </div>
      )}
    </>
  );
}
