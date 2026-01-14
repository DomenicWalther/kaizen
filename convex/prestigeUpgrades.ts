import { getCurrentUser } from './lib/auth';
import { query } from './_generated/server';
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
