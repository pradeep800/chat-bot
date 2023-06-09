import { useEffect } from "react";
import { useAuth } from "~/utils/useAuth";
import { useInfo } from "~/utils/userInfoStore";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "~/utils/firebase";
import Link from "next/link";
import Image from "next/image";
export default function Navbar() {
  const userInfo = useInfo((state) => state.userInfo);

  function SignInClick() {
    const provider = new GoogleAuthProvider();
    void signInWithPopup(auth, provider);
  }
  return (
    <nav
      style={{ background: "rgba(255, 255, 255, 0.9)" }}
      className=" sticky top-0 flex bg-white p-1"
    >
      <Link className="mr-auto" href="/">
        <div className="mr-auto p-1 text-2xl font-bold">Chat</div>
      </Link>

      {userInfo.email ? (
        <div className="flex  gap-1">
          <Image
            className="rounded-full "
            src={userInfo.profilePhoto}
            alt="your Photo"
            width={40}
            height={40}
          />
          <button
            className="rounded bg-red-300 p-2 hover:bg-red-400"
            onClick={() => void signOut(auth)}
          >
            SignOut
          </button>
        </div>
      ) : (
        <button
          className="rounded bg-blue-300 px-3 py-2 hover:bg-blue-400"
          onClick={SignInClick}
        >
          Login
        </button>
      )}
    </nav>
  );
}
