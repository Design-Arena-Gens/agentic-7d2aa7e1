import { NextRequest } from "next/server";
import { z } from "zod";
import { tool, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const runtime = "edge";

const mathTool = tool({
  description: "Perform a basic math calculation using JavaScript eval in a sandboxed way.",
  parameters: z.object({ expression: z.string().describe("Math expression, e.g. 2+2*5") }),
  execute: async ({ expression }) => {
    // Extremely basic evaluation: only digits, operators, parentheses, decimal, spaces
    if (!/^[-+*/(). 0-9]+$/.test(expression)) {
      return "Invalid expression";
    }
    try {
      // eslint-disable-next-line no-new-func
      const fn = Function(`"use strict"; return (${expression});`);
      const result = fn();
      return String(result);
    } catch {
      return "Error evaluating expression";
    }
  },
});

const webFetchTool = tool({
  description: "Fetch a web page as text via server, then summarize.",
  parameters: z.object({ url: z.string().url().describe("HTTP or HTTPS URL") }),
  execute: async ({ url }) => {
    const resp = await fetch(url, { headers: { "user-agent": "AgenticChat/1.0" } });
    const text = await resp.text();
    // Return first 2000 chars to keep tokens small
    return text.slice(0, 2000);
  },
});

function getModelFromHeaders(req: NextRequest) {
  const provider = req.headers.get("x-provider") || "openai";
  const openaiKey = req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY || "";

  if (provider === "mock") {
    return {
      type: "mock" as const,
      generate: async (prompt: string) =>
        `Mock assistant reply to: ${prompt}. (No real AI used.)`,
    };
  }

  const openai = createOpenAI({ apiKey: openaiKey });
  return { type: "openai" as const, openai };
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const modelChoice = getModelFromHeaders(req);

  if (modelChoice.type === "mock") {
    const last = messages?.[messages.length - 1]?.content || "";
    const mockText = await modelChoice.generate(last);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(mockText));
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const result = await streamText({
    model: modelChoice.openai("gpt-4o-mini"),
    messages,
    maxTokens: 800,
    temperature: 0.4,
    system:
      "You are an AI agent with access to tools. Prefer using tools when they help.",
    tools: {
      math: mathTool,
      webFetch: webFetchTool,
    },
  });

  return result.toAIStreamResponse();
}
