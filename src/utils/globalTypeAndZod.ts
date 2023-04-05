import { z } from "zod";
export const zUserInfoSchema = z.object({
  profilePhoto: z.string(),
  userId: z.string(),
  email: z.string().email(),
});
export const zUserInfoSchemaSetter = z.function(
  z.tuple([zUserInfoSchema]),
  z.void()
);
export const zUserInfoSchemaGetterAndSetter = z.object({
  userInfo: zUserInfoSchema,
  setUserInfo: zUserInfoSchemaSetter,
  loading: z.boolean(),
  setLoading: z.function(z.tuple([z.boolean()], z.void())),
});

export type UserInfoSchemaGetterAndSetter = z.infer<
  typeof zUserInfoSchemaGetterAndSetter
>;
export type UserInfo = z.infer<typeof zUserInfoSchema>;
