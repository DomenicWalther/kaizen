import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  tasks: defineTable({
    isCompleted: v.boolean(),
    text: v.string(),
  }),

  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index('by_token', ['tokenIdentifier']),

  prestigeUpgrades: defineTable({
    id: v.string(),
    currentLevel: v.number(),
    userId: v.id('users'),
  }).index('by_user', ['userId']),

  goldUpgrades: defineTable({
    id: v.string(),
    currentLevel: v.number(),
    userId: v.id('users'),
  }).index('by_user', ['userId']),
});
