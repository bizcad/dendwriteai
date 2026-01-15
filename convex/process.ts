import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getProvider } from "./llm_provider";

const CONFIDENCE_THRESHOLD = 0.6;

/**
 * Mutation: Classify all pending captures
 */
export const classifyAllPending = mutation({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("captures")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    console.log(`Found ${pending.length} pending captures to classify`);

    const results = [];
    const provider = getProvider();

    for (const capture of pending) {
      try {
        console.log(`Classifying: ${capture.text.substring(0, 50)}`);
        
        // Call Claude directly
        const result = await provider.classify(capture.text);
        console.log(`Got classification: ${result.category} (confidence: ${result.confidence})`);

        // Update capture status to classified
        await ctx.db.patch(capture._id, {
          status: "classified",
        });

        // Log to inbox
        await ctx.db.insert("inboxLog", {
          captureId: capture._id,
          classification: result.category,
          confidence: result.confidence,
          status:
            result.confidence >= CONFIDENCE_THRESHOLD ? "success" : "error",
          reasoning: result.reasoning,
          createdAt: Date.now(),
        });

        // If low confidence, add to lowConfidence table
        if (result.confidence < CONFIDENCE_THRESHOLD) {
          await ctx.db.insert("lowConfidence", {
            captureText: capture.text,
            classificationAttempt: result.category,
            reason: result.reasoning,
            flaggedAt: Date.now(),
            confidence: result.confidence,
          });
        } else {
          // Route to appropriate category table
          const categoryTable = result.category as
            | "people"
            | "projects"
            | "ideas"
            | "admin";

          await ctx.db.insert(categoryTable, {
            name: capture.text.substring(0, 50),
            description: capture.text,
            confidence: result.confidence,
            sourceCapture: capture._id,
            extractedAt: Date.now(),
          });
        }

        results.push({
          captureId: capture._id,
          success: true,
          category: result.category,
          confidence: result.confidence,
        });
        console.log(`✓ Classified: ${capture._id}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.push({
          captureId: capture._id,
          success: false,
          error: errorMsg,
        });
        console.error(`✗ Failed to classify ${capture._id}: ${errorMsg}`);
      }
    }

    console.log(`Classification complete. Results:`, results);
    return results;
  },
});
