import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return Response.json(
        { error: "Email parameter required" },
        { status: 400 },
      );
    }

    const user = await convex.query(api.auth.getUserByEmail, { email });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch user";
    return Response.json({ error: message }, { status: 500 });
  }
}
