import { MutationCtx, QueryCtx } from '../_generated/server';
import { Doc } from '../_generated/dataModel';

export async function getCurrentUser(ctx: QueryCtx | MutationCtx): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query('users')
    .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .first();
}
