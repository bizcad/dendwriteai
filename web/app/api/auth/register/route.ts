import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

// Initialize Convex HTTP client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { email, name, passwordHash } = await request.json();

    if (!email || !name || !passwordHash) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Call Convex mutation
    const result = await convex.mutation(api.auth.register, {
      email,
      name,
      passwordHash,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
