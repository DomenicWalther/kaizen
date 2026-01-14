import { getCurrentUser } from './lib/auth';
import { query } from './_generated/server';
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
