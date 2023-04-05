import { z } from "zod";
import { create } from "zustand";
import { UserInfoSchemaGetterAndSetter } from "./globalTypeAndZod";
/*
 * Store of Storing user Information
 * i am using 2 stores because i don't want to persisted name
 */

export const useInfo = create<UserInfoSchemaGetterAndSetter>(
  (set): UserInfoSchemaGetterAndSetter => ({
    userInfo: {
      profilePhoto: "",
      email: "",
      userId: "",
    },

    setUserInfo: ({ email, userId, profilePhoto }) => {
      set(() => ({ userInfo: { email, userId, profilePhoto } }));
    },
    loading: true,
    setLoading: (loading) => {
      set(() => ({ loading }));
    },
  })
);
