import { useInfo } from "~/utils/userInfoStore";

export default function CheckAuth({ children }: { children: React.ReactNode }) {
  const userInfo = useInfo((state) => state.userInfo);

  return (
    <>
      {userInfo.email ? (
        <>{children}</>
      ) : (
        <div>Please Login Before Using This App</div>
      )}
    </>
  );
}
