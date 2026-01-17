import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index('by_token', ['tokenIdentifier']),

  prestigeUpgrades: defineTable({
    id: v.string(),
    currentLevel: v.number(),
    userId: v.id('users'),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_id', ['userId', 'id']),

  goldUpgrades: defineTable({
    id: v.string(),
    currentLevel: v.number(),
    userId: v.id('users'),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_id', ['userId', 'id']),

  alchemyUpgrades: defineTable({
    id: v.string(),
    currentLevel: v.number(),
    userId: v.id('users'),
  }),

  character: defineTable({
    id: v.string(),
    userId: v.id('users'),

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
  })
    .index('by_user', ['userId'])
    .index('by_user_and_id', ['userId', 'id']),
});
