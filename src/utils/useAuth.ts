import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { useEffect, useState } from "react";
import { api } from "./api";
import { browserLocalPersistence, setPersistence } from "firebase/auth";

export function useAuth() {
  const [user] = useAuthState(auth);
  const [userInformation, setUserInformation] = useState({
    profilePhoto: "",
    userId: "",
    email: "",
  });
  const { data } = api.authentication.login.useQuery();

  useEffect(() => {
    if (!user) {
      setUserInformation({ profilePhoto: "", userId: "", email: "" });
    }
    if (data && user) {
      setUserInformation(data);
    }
  }, [user, data]);

  return userInformation;
}
