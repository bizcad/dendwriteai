import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(), // bcrypt hash
    tenantId: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_tenantId", ["tenantId"]),

  captures: defineTable({
    text: v.string(),
    clientMessageId: v.string(),
    status: v.union(v.literal("pending"), v.literal("classified"), v.literal("error")),
    tenantId: v.optional(v.string()), // Made optional to handle migration from old records
    userId: v.optional(v.id("users")), // Made optional to handle migration from old records
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_tenantId", ["tenantId"])
    .index("by_tenantId_status", ["tenantId", "status"]),
  
  people: defineTable({
    name: v.string(),
    description: v.string(),
    confidence: v.number(),
    sourceCapture: v.id("captures"),
    tenantId: v.string(),
    extractedAt: v.number(),
  }).index("by_sourceCapture", ["sourceCapture"]).index("by_tenantId", ["tenantId"]),

  projects: defineTable({
    name: v.string(),
    description: v.string(),
    confidence: v.number(),
    sourceCapture: v.id("captures"),
    tenantId: v.string(),
    extractedAt: v.number(),
  }).index("by_sourceCapture", ["sourceCapture"]).index("by_tenantId", ["tenantId"]),

  ideas: defineTable({
    name: v.string(),
    description: v.string(),
    confidence: v.number(),
    sourceCapture: v.id("captures"),
    tenantId: v.string(),
    extractedAt: v.number(),
  }).index("by_sourceCapture", ["sourceCapture"]).index("by_tenantId", ["tenantId"]),

  admin: defineTable({
    title: v.string(),
    description: v.string(),
    confidence: v.number(),
    sourceCapture: v.id("captures"),
    tenantId: v.string(),
    extractedAt: v.number(),
  }).index("by_sourceCapture", ["sourceCapture"]).index("by_tenantId", ["tenantId"]),

  lowConfidence: defineTable({
    captureText: v.string(),
    classificationAttempt: v.string(),
    confidence: v.number(),
    reason: v.string(),
    tenantId: v.optional(v.string()), // Made optional for migration
    flaggedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    manualCategory: v.optional(v.string()),
  }).index("by_flaggedAt", ["flaggedAt"]).index("by_tenantId", ["tenantId"]),

  inboxLog: defineTable({
    captureId: v.id("captures"),
    classification: v.string(),
    confidence: v.number(),
    reasoning: v.string(),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("overridden")),
    tenantId: v.optional(v.string()), // Made optional for migration
    createdAt: v.number(),
    overriddenBy: v.optional(v.object({
      newCategory: v.string(),
      timestamp: v.number(),
      reason: v.optional(v.string()),
    })),
  }).index("by_captureId", ["captureId"]).index("by_tenantId", ["tenantId"]),
});
