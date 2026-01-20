import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
export async function POST(request: Request) {
  try {
    const { text, email, clientMessageId } = await request.json();

    console.log("📝 API Capture: Received data", {
      text: text?.substring(0, 50),
      email,
      clientMessageId,
    });

    if (!text || !email || !clientMessageId) {
      console.warn("⚠️ API Capture: Missing required fields");
      return Response.json(
        { error: "Missing required fields: text, email, clientMessageId" },
        { status: 400 },
      );
    }

    const CONVEX_URL =
      process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
    console.log("🔗 API Capture: Using Convex URL:", CONVEX_URL);

    const convex = new ConvexHttpClient(CONVEX_URL);

    try {
      console.log("⏳ API Capture: Calling Convex mutation...");
      const result = await convex.mutation(api.captures.submitCapture, {
        text,
        email,
        clientMessageId,
      });

      console.log("✅ API Capture: Mutation succeeded", result);

      return Response.json({
        success: true,
        id: result.id,
        status: result.status,
        message: result.message,
      });
    } catch (convexError) {
      const msg =
        convexError instanceof Error
          ? convexError.message
          : String(convexError);
      console.error("❌ API Capture: Convex error", msg);
      return Response.json(
        {
          error: `Convex error: ${msg}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ API Capture: General error", errorMessage);
    return Response.json(
      {
        error: `Server error: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
