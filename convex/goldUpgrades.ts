import { getCurrentUser } from './lib/auth';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
export const getGoldUpgrades = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const goldUpgrades = await ctx.db
      .query('goldUpgrades')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    return goldUpgrades;
  },
});

export const updateGoldUpgradeLevels = mutation({
  args: { upgrades: v.array(v.object({ id: v.string(), currentLevel: v.number() })) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    for (const upgrade of args.upgrades) {
      const existing = await ctx.db
        .query('goldUpgrades')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('id'), upgrade.id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { currentLevel: upgrade.currentLevel });
      }
    }
  },
});
