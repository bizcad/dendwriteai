import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitCapture = mutation({
  args: {
    text: v.string(),
    clientMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const capture = await ctx.db.insert("captures", {
      text: args.text,
      clientMessageId: args.clientMessageId,
      status: "pending",
      createdAt: Date.now(),
    });

    return {
      id: capture,
      status: "pending",
      message: "Capture received. Ready for classification.",
    };
  },
});

export const getCaptures = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("captures").collect();
  },
});

export const getCaptureById = query({
  args: { id: v.id("captures") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
