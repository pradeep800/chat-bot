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
      id: "",
    },

    setUserInfo: ({ email, id, profilePhoto }) => {
      set(() => ({ userInfo: { email, id, profilePhoto } }));
    },
  })
);
