import { useEffect } from "react";
import { useAuth } from "~/utils/useAuth";
import { useInfo } from "~/utils/userInfoStore";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "~/utils/firebase";
export default function Navbar() {
  const setUserInfo = useInfo((state) => state.setUserInfo);
  const userInfo = useInfo((state) => state.userInfo);
  const userInfoFromAuth = useAuth();
  useEffect(() => {
    void setUserInfo(userInfoFromAuth);
  }, [userInfoFromAuth]);
  function SignInClick() {
    const provider = new GoogleAuthProvider();
    void signInWithPopup(auth, provider);
  }
  return (
    <nav className="flex">
      <div className="mr-auto">Chat</div>
      {userInfo.email ? (
        <div onClick={() => void signOut(auth)}>SignOut</div>
      ) : (
        <div onClick={SignInClick}>Login</div>
      )}
    </nav>
  );
}
