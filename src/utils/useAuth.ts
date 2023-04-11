import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { useEffect } from "react";
import { api } from "./api";
import { useInfo } from "./userInfoStore";

export function useAuth() {
  const [user, loading] = useAuthState(auth);
  const setLoading = useInfo((state) => state.setLoading);
  const setUserInfo = useInfo((state) => state.setUserInfo);
  const { data, mutate } = api.authentication.login.useMutation({
    onSuccess: (data) => {
      setUserInfo(data);
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });
  useEffect(() => {
    if (!user) {
      setUserInfo({ profilePhoto: "", userId: "", email: "" });
    } else {
      mutate();
      return;
    }
    if (!loading) {
      const timeout = setTimeout(() => {
        setLoading(loading);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    setLoading(loading);
  }, [user, loading]);
}
