import { getCurrentUser } from './lib/auth';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

function assertFiniteNonNegative(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid ${field}`);
  }
}

function assertCharacterPayload(args: {
  prestigeLevel: number;
  prestigeMultipliers: { strength: number; intelligence: number; endurance: number };
  prestigeCores: number;
  gold: number;
  currentStage: number;
  currentWave: number;
}) {
  assertFiniteNonNegative(args.prestigeLevel, 'prestigeLevel');
  assertFiniteNonNegative(args.prestigeCores, 'prestigeCores');
  assertFiniteNonNegative(args.gold, 'gold');
  assertFiniteNonNegative(args.currentStage, 'currentStage');
  assertFiniteNonNegative(args.currentWave, 'currentWave');

  if (!Number.isInteger(args.currentStage) || args.currentStage < 1) {
    throw new Error('Invalid currentStage');
  }
  if (!Number.isInteger(args.currentWave) || args.currentWave < 1 || args.currentWave > 10) {
    throw new Error('Invalid currentWave');
  }

  const { strength, intelligence, endurance } = args.prestigeMultipliers;
  assertFiniteNonNegative(strength, 'prestigeMultipliers.strength');
  assertFiniteNonNegative(intelligence, 'prestigeMultipliers.intelligence');
  assertFiniteNonNegative(endurance, 'prestigeMultipliers.endurance');
}

export const getCharacter = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const character = await ctx.db
      .query('character')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .unique();

    return character;
  },
});
export const updateCharacter = mutation({
  args: {
    id: v.string(),
    prestigeLevel: v.number(),
    prestigeMultipliers: v.object({
      strength: v.number(),
      intelligence: v.number(),
      endurance: v.number(),
    }),
    prestigeCores: v.number(),
    gold: v.number(),
    currentStage: v.number(),
    currentWave: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    assertCharacterPayload(args);

    const existing = await ctx.db
      .query('character')
      .withIndex('by_user_and_id', (q) => q.eq('userId', user._id).eq('id', args.id))
      .first();

    const { id, ...updateData } = args;

    if (existing) {
      await ctx.db.patch(existing._id, updateData);
    } else {
      await ctx.db.insert('character', {
        ...args,
        userId: user._id,
      });
    }
  },
});
