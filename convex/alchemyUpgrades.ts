import { getCurrentUser } from './lib/auth';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
export const getAlchemyUpgrades = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const alchemyUpgrades = await ctx.db
      .query('alchemyUpgrades')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    return alchemyUpgrades;
  },
});

export const updateAlchemyUpgradeLevels = mutation({
  args: { upgrades: v.array(v.object({ id: v.string(), currentLevel: v.number() })) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    await Promise.all(
      args.upgrades.map(async (upgrade) => {
        const existing = await ctx.db
          .query('alchemyUpgrades')
          .withIndex('by_user_and_id', (q) => q.eq('userId', user._id).eq('id', upgrade.id))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, { currentLevel: upgrade.currentLevel });
        }
      }),
    );
  },
});
