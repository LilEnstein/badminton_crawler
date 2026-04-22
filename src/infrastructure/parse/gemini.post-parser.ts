import { readFileSync } from "node:fs";
import { join } from "node:path";

import { InvalidParserOutputError, ProviderUnavailableError } from "@/domain/session/errors";
import type { PostParser, ParserOutput } from "@/application/parse/ports";
import { parserOutputSchema } from "./schemas/parser-output.zod";

// process.cwd() is the project root in both dev and Next.js Node runtime
const PROMPT_PATH = join(process.cwd(), "src/infrastructure/parse/prompts/parse-post.vi.md");
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

let cachedPrompt: string | null = null;

function loadPrompt(): string {
  if (cachedPrompt) return cachedPrompt;
  cachedPrompt = readFileSync(PROMPT_PATH, "utf8");
  return cachedPrompt;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

export class GeminiPostParser implements PostParser {
  readonly name = "gemini";

  constructor(private apiKey: string) {}

  async parse(text: string): Promise<ParserOutput> {
    const systemPrompt = loadPrompt();
    const userContent = `Parse this post:\n\n${text}`;

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 1024
      }
    };

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch (err) {
      throw new ProviderUnavailableError(`gemini: ${String(err)}`);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      throw new ProviderUnavailableError(`gemini HTTP ${res.status}: ${detail}`);
    }

    const data = (await res.json()) as GeminiResponse;

    if (data.error) {
      throw new ProviderUnavailableError(`gemini: ${data.error.message}`);
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!raw) throw new InvalidParserOutputError("empty response from Gemini");

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InvalidParserOutputError(`non-JSON response: ${raw.slice(0, 200)}`);
    }

    const result = parserOutputSchema.safeParse(parsed);
    if (!result.success) {
      throw new InvalidParserOutputError(result.error.issues.map((i) => i.message).join("; "));
    }

    return result.data;
  }
}
