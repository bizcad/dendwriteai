import { mutation, action, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getProvider } from "./llm_provider";

const CONFIDENCE_THRESHOLD = 0.6;

/**
 * Action: Call Claude to classify a capture
 */
export const classifyCapture = action({
  args: { text: v.string(), captureId: v.id("captures") },
  handler: async (ctx, args) => {
    const provider = getProvider();
    const result = await provider.classify(args.text);

    // Now record the result in a mutation
    await ctx.runMutation(recordClassificationMutation, {
      captureId: args.captureId,
      classificationResult: {
        category: result.category,
        confidence: result.confidence,
        reasoning: result.reasoning,
      },
    });

    return result;
  },
});

/**
 * Mutation: Record classification result and route to appropriate table
 */
export const recordClassificationMutation = mutation({
  args: {
    captureId: v.id("captures"),
    classificationResult: v.object({
      category: v.union(
        v.literal("people"),
        v.literal("projects"),
        v.literal("ideas"),
        v.literal("admin"),
        v.literal("uncategorized")
      ),
      confidence: v.number(),
      reasoning: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { captureId, classificationResult } = args;

    // Update capture status to classified
    await ctx.db.patch(captureId, {
      status: "classified",
    });

    // Log to inbox
    const logEntry = await ctx.db.insert("inboxLog", {
      captureId,
      classification: classificationResult.category,
      confidence: classificationResult.confidence,
      status:
        classificationResult.confidence >= CONFIDENCE_THRESHOLD
          ? "success"
          : "error",
      reasoning: classificationResult.reasoning,
      createdAt: Date.now(),
    });

    // If low confidence, add to lowConfidence table for review
    if (classificationResult.confidence < CONFIDENCE_THRESHOLD) {
      const capture = await ctx.db.get(captureId);
      if (capture) {
        await ctx.db.insert("lowConfidence", {
          captureText: capture.text,
          classificationAttempt: classificationResult.category,
          reason: classificationResult.reasoning,
          flaggedAt: Date.now(),
          confidence: classificationResult.confidence,
        });
      }
    } else {
      // Route to appropriate category table
      const capture = await ctx.db.get(captureId);
      if (capture) {
        const categoryTable = classificationResult.category as
          | "people"
          | "projects"
          | "ideas"
          | "admin";

        await ctx.db.insert(categoryTable, {
          name: capture.text.substring(0, 50), // First 50 chars as name
          description: capture.text,
          confidence: classificationResult.confidence,
          sourceCapture: captureId,
          extractedAt: Date.now(),
        });
      }
    }

    return logEntry;
  },
});

// Helper to record classification (for internal use)
export async function recordClassification(
  ctx: MutationCtx,
  args: {
    captureId: string;
    classificationResult: {
      category: "people" | "projects" | "ideas" | "admin" | "uncategorized";
      confidence: number;
      reasoning: string;
    };
  }
) {
  const { captureId, classificationResult } = args;

  // Update capture status to classified
  await ctx.db.patch(captureId as any, {
    status: "classified",
  });

  // Log to inbox
  const logEntry = await ctx.db.insert("inboxLog", {
    captureId: captureId as any,
    classification: classificationResult.category,
    confidence: classificationResult.confidence,
    status:
      classificationResult.confidence >= CONFIDENCE_THRESHOLD
        ? "success"
        : "error",
    reasoning: classificationResult.reasoning,
    createdAt: Date.now(),
  });

  // If low confidence, add to lowConfidence table for review
  if (classificationResult.confidence < CONFIDENCE_THRESHOLD) {
    const capture = await ctx.db.get(captureId as any);
    if (capture) {
      await ctx.db.insert("lowConfidence", {
        captureText: capture.text,
        classificationAttempt: classificationResult.category,
        reason: classificationResult.reasoning,
        flaggedAt: Date.now(),
        confidence: classificationResult.confidence,
      });
    }
  } else {
    // Route to appropriate category table
    const capture = await ctx.db.get(captureId as any);
    if (capture) {
      const categoryTable = classificationResult.category as
        | "people"
        | "projects"
        | "ideas"
        | "admin";

      await ctx.db.insert(categoryTable, {
        name: capture.text.substring(0, 50), // First 50 chars as name
        description: capture.text,
        confidence: classificationResult.confidence,
        sourceCapture: captureId as any,
        extractedAt: Date.now(),
      });
    }
  }

  return logEntry;
}

/**
 * Mutation: Manually override a classification
 */
export const updateClassification = mutation({
  args: {
    captureId: v.id("captures"),
    newCategory: v.union(
      v.literal("people"),
      v.literal("projects"),
      v.literal("ideas"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    const { captureId, newCategory } = args;

    // Get the capture
    const capture = await ctx.db.get(captureId);
    if (!capture) throw new Error("Capture not found");

    // Find existing entry in any category table
    const peopleEntries = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("sourceCapture"), captureId))
      .collect();
    const projectEntries = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("sourceCapture"), captureId))
      .collect();
    const ideaEntries = await ctx.db
      .query("ideas")
      .filter((q) => q.eq(q.field("sourceCapture"), captureId))
      .collect();
    const adminEntries = await ctx.db
      .query("admin")
      .filter((q) => q.eq(q.field("sourceCapture"), captureId))
      .collect();

    // Delete from all category tables
    for (const entry of [
      ...peopleEntries,
      ...projectEntries,
      ...ideaEntries,
      ...adminEntries,
    ]) {
      await ctx.db.delete(entry._id);
    }

    // Insert into new category table
    const newEntry = await ctx.db.insert(newCategory, {
      name: capture.text.substring(0, 50),
      description: capture.text,
      confidence: 0.8, // Manual override gets high confidence
      sourceCapture: captureId,
      createdAt: Date.now(),
    });

    // Log the override
    await ctx.db.insert("inboxLog", {
      captureId,
      classification: newCategory,
      confidence: 0.8,
      status: "overridden",
      reasoning: "Manually overridden by user",
      createdAt: Date.now(),
    });

    return newEntry;
  },
});

/**
 * Query: Get all classifications for a capture
 */
export const getClassifications = query({
  args: { captureId: v.id("captures") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("inboxLog")
      .filter((q) => q.eq(q.field("captureId"), args.captureId))
      .collect();

    return logs;
  },
});
