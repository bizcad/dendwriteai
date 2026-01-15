export interface ClassificationResult {
  category: "people" | "projects" | "ideas" | "admin" | "uncategorized";
  confidence: number; // 0-1
  reasoning: string;
}

const SYSTEM_PROMPT = `You are an expert at categorizing user ideas and thoughts into meaningful buckets.

Classify the user's input into ONE of these categories:
- "people": Names, contacts, or ideas about specific people
- "projects": Work items, tasks, or project ideas
- "ideas": Creative concepts, insights, or general ideas
- "admin": Administrative tasks, reminders, or meta-thoughts
- "uncategorized": If it doesn't fit any category

Respond in JSON format:
{
  "category": "people" | "projects" | "ideas" | "admin" | "uncategorized",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why you chose this category"
}

Be confident in your classifications. Use high confidence (0.7+) when the category is clear.
Flag as lower confidence (0.5-0.6) only if the input is ambiguous or could fit multiple categories.`;

// Helper to get API key from environment
function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. ' +
      'Set it in your Convex Dashboard secrets or local .env.local file.'
    );
  }
  return apiKey;
}

export class AnthropicProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getApiKey();
  }

  async classify(text: string): Promise<ClassificationResult> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Classify this: "${text}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Anthropic API error:", response.status, errorData);
        return {
          category: "uncategorized",
          confidence: 0.2,
          reasoning: `API error: ${response.statusText}`,
        };
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };

      // Extract JSON from response
      const responseText =
        data.content?.[0]?.type === "text" ? data.content[0].text : "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error("No JSON in response:", responseText);
        return {
          category: "uncategorized",
          confidence: 0.3,
          reasoning: "Failed to parse LLM response",
        };
      }

      const result = JSON.parse(jsonMatch[0]) as ClassificationResult;

      // Validate result
      if (
        !["people", "projects", "ideas", "admin", "uncategorized"].includes(
          result.category
        )
      ) {
        result.category = "uncategorized";
      }

      result.confidence = Math.max(0, Math.min(1, result.confidence));

      return result;
    } catch (error) {
      console.error("LLM classification error:", error);
      return {
        category: "uncategorized",
        confidence: 0,
        reasoning: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

// Export singleton provider
let provider: AnthropicProvider | null = null;

export function getProvider(): AnthropicProvider {
  if (!provider) {
    provider = new AnthropicProvider();
  }
  return provider;
}
