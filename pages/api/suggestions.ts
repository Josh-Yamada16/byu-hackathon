import { generateText } from "ai";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";

const NEWLINE_RE = /\r?\n/;

const bodySchema = z.object({
  lastMessage: z.string().optional(),
  limit: z.number().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const parse = bodySchema.safeParse(req.body || {});
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { lastMessage = "", limit = 4 } = parse.data;

  try {
    // The API may receive either an assistant reply or a user message as
    // `lastMessage`. In practice we prefer to base suggestions on the
    // assistant's response (so the suggestions relate to what the agent said).
    // Provide a few-shot example and require a strict JSON array output.
    const prompt = `The input may be either an assistant reply or a user's message.\n\nInput:\n"${lastMessage}"\n\nIf the input is an assistant reply, generate up to ${limit} concise, relevant follow-up questions a user would reasonably ask the agent next — focusing on clarifying, next steps, or actions the user can take based on the assistant response. If the input is a user message, generate up to ${limit} clarifying or next-step follow-up questions the user could suggest.\n\nFormat: Return ONLY a JSON array of strings (e.g. ["Question 1","Question 2"]). Do not include any surrounding explanation.\n\nExamples:\nAssistant reply: "I recommend splitting the project into three phases: research, prototype, and testing. Start with a short literature review to identify key methods."\nOutput: ["Can you summarize the top 3 papers I should start with?","What's a minimal prototype I can build to validate the idea?","How long should the testing phase be and what metrics should I track?"]\n\nUser message: "I need help designing an experiment to test the new alloy."\nOutput: ["What specific properties of the alloy do you want to measure?","Do you have access to tensile testing equipment?","What sample sizes can you prepare for testing?"]\n\nNow produce the JSON array of up to ${limit} suggestions for the provided input.`;

    const { text: outputText } = await generateText({
      model: myProvider.languageModel("chat-model"),
      system:
        "You are a helpful assistant that suggests concise, focused, and actionable follow-up questions. Always return a JSON array of strings only.",
      prompt,
    });

    // Try to parse JSON from model output
    let suggestions: string[] = [];
    const text = outputText || "";
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        suggestions = parsed.map(String).slice(0, limit);
      }
    } catch (_unused) {
      // fallback: split by newlines and take lines
      suggestions = text
        .split(NEWLINE_RE)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, limit);
    }

    return res.status(200).json({ suggestions });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating suggestions", error);
    return res.status(500).json({ error: "Failed to generate suggestions" });
  }
}
