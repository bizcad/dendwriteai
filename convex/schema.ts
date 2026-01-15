import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  captures: defineTable({
    text: v.string(),
    clientMessageId: v.string(),
    status: v.union(v.literal("pending"), v.literal("classified"), v.literal("error")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
  
  people: defineTable({
    name: v.string(),
    description: v.string(),
    confidence: v.number(),
    sourceCapture: v.id("captures"),
    extractedAt: v.number(),
  }).index("by_sourceCapture", ["sourceCapture"]),

  projects: defineTable({
    name: v.string(),
    description: v.string(),
    confidence: v.number(),
    sourceCapture: v.id("captures"),
    extractedAt: v.number(),
  }).index("by_sourceCapture", ["sourceCapture"]),

  ideas: defineTable({
    name: v.string(),
    description: v.string(),
    confidence: v.number(),
    sourceCapture: v.id("captures"),
    extractedAt: v.number(),
  }).index("by_sourceCapture", ["sourceCapture"]),

  admin: defineTable({
    title: v.string(),
    description: v.string(),
    confidence: v.number(),
    sourceCapture: v.id("captures"),
    extractedAt: v.number(),
  }).index("by_sourceCapture", ["sourceCapture"]),

  lowConfidence: defineTable({
    captureText: v.string(),
    classificationAttempt: v.string(),
    confidence: v.number(),
    reason: v.string(),
    flaggedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    manualCategory: v.optional(v.string()),
  }).index("by_flaggedAt", ["flaggedAt"]),

  inboxLog: defineTable({
    captureId: v.id("captures"),
    classification: v.string(),
    confidence: v.number(),
    reasoning: v.string(),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("overridden")),
    createdAt: v.number(),
    overriddenBy: v.optional(v.object({
      newCategory: v.string(),
      timestamp: v.number(),
      reason: v.optional(v.string()),
    })),
  }).index("by_captureId", ["captureId"]),
});
