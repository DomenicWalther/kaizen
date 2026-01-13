import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
export const listTodos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tasks').collect();
  },
});

export const updateTodo = mutation({
  args: { id: v.id('tasks'), isCompleted: v.boolean(), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch('tasks', args.id, {
      isCompleted: args.isCompleted,
      text: args.text,
    });
  },
});
