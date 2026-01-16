import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitCapture = mutation({
  args: {
    text: v.string(),
    clientMessageId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { text, clientMessageId, email }) => {
    // Look up user by email
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    // If user doesn't exist, create them with a new tenant
    if (!user) {
      const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const userId = await ctx.db.insert("users", {
        email,
        name: email.split("@")[0], // Use email prefix as default name
        passwordHash: "", // Empty for now, should be set during signup
        tenantId,
        createdAt: Date.now(),
      });
      user = { _id: userId, email, tenantId, createdAt: Date.now() };
    }

    const capture = await ctx.db.insert("captures", {
      text,
      clientMessageId,
      status: "pending",
      userId: user._id,
      tenantId: user.tenantId,
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
  args: {
    tenantId: v.string(),
  },
  handler: async (ctx, { tenantId }) => {
    return await ctx.db
      .query("captures")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
      .order("desc")
      .collect();
  },
});

export const getPendingCaptures = query({
  args: {
    tenantId: v.string(),
  },
  handler: async (ctx, { tenantId }) => {
    return await ctx.db
      .query("captures")
      .withIndex("by_tenantId_status", (q) =>
        q.eq("tenantId", tenantId).eq("status", "pending")
      )
      .order("desc")
      .collect();
  },
});

export const getCaptureById = query({
  args: {
    id: v.id("captures"),
    tenantId: v.string(),
  },
  handler: async (ctx, { id, tenantId }) => {
    const capture = await ctx.db.get(id);
    // Verify tenant ownership
    if (capture?.tenantId !== tenantId) {
      throw new Error("Unauthorized: Capture does not belong to this tenant");
    }
    return capture;
  },
});
