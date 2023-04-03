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
  async function SignInClick() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }
  return (
    <nav>
      <div>Chat</div>
      {userInfo.email ? (
        <div onClick={() => void signOut(auth)}>SignOut</div>
      ) : (
        <div onClick={void SignInClick}>Login</div>
      )}
    </nav>
  );
}
