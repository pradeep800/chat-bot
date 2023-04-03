import { z } from "zod";
export const zUserInfoSchema = z.object({
  profilePhoto: z.string(),
  id: z.string(),
  email: z.string().email(),
});
export const zUserInfoSchemaSetter = z.function(
  z.tuple([zUserInfoSchema]),
  z.void()
);
export const zUserInfoSchemaGetterAndSetter = z.object({
  userInfo: zUserInfoSchema,
  setUserInfo: zUserInfoSchemaSetter,
});

export type UserInfoSchemaGetterAndSetter = z.infer<
  typeof zUserInfoSchemaGetterAndSetter
>;
export type UserInfo = z.infer<typeof zUserInfoSchema>;
