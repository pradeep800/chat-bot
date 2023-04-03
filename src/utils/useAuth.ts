import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { useEffect, useState } from "react";
import { api } from "./api";

export function useAuth() {
  const [user] = useAuthState(auth);
  const [userInformation, setUserInformation] = useState({
    profilePhoto: "",
    id: "",
    email: "",
  });
  const { data } = api.authentication.login.useQuery();
  useEffect(() => {
    if (!user) {
      setUserInformation({ profilePhoto: "", id: "", email: "" });
    }
    if (data && user) {
      setUserInformation(data);
    }
  }, [user, data]);
  return userInformation;
}
