import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { generateId } from "@/lib/utils/generate-id";
import { hashToken } from "@/lib/utils/tokens/hash-token";
import { apiTokens } from "@/server/db/schema";

import type { ProtectedTRPCContext } from "../../trpc";
import type { CreateTokenInput, DeleteTokenInput } from "./token.input";

export const getUserTokens = async (ctx: ProtectedTRPCContext) => {
  return ctx.db.query.apiTokens.findMany({
    where: eq(apiTokens.userId, ctx.auth.userId),
    orderBy: (apiTokens, { desc }) => [desc(apiTokens.createdAt)],
  });
};

export const createToken = async (ctx: ProtectedTRPCContext, input: CreateTokenInput) => {
  const token = generateId(32);
  const hashedToken = hashToken(token);
  const firstFourChars = token.slice(0, 4);

  const createdToken = await ctx.db
    .insert(apiTokens)
    .values({
      id: generateId(15),
      userId: ctx.auth.userId,
      name: input.name,
      token: hashedToken,
      firstFourChars,
    })
    .returning({ id: apiTokens.id });

  return {
    id: createdToken[0]!.id,
    token: token,
  };
};

export const deleteToken = async (ctx: ProtectedTRPCContext, input: DeleteTokenInput) => {
  const deletedToken = await ctx.db
    .delete(apiTokens)
    .where(eq(apiTokens.id, input.id))
    .returning({ id: apiTokens.id });

  if (deletedToken.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Token not found",
    });
  }

  return { success: true };
};
