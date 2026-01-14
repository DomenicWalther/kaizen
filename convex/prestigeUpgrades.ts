import { getCurrentUser } from './lib/auth';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
export const getPrestigeUpgrades = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const prestigeUpgrades = await ctx.db
      .query('prestigeUpgrades')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    return prestigeUpgrades;
  },
});

export const updatePrestigeUpgradeLevels = mutation({
  args: { upgrades: v.array(v.object({ id: v.string(), currentLevel: v.number() })) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    for (const upgrade of args.upgrades) {
      const existing = await ctx.db
        .query('prestigeUpgrades')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('id'), upgrade.id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { currentLevel: upgrade.currentLevel });
      }
    }
  },
});
