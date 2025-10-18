import { openai } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        // Use OpenAI provider models for local development. Replace model IDs as needed.
        "chat-model": openai.languageModel("gpt-4o-mini"),
        "chat-model-reasoning": wrapLanguageModel({
          model: openai.languageModel("gpt-4o-mini"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": openai.languageModel("gpt-4o-mini"),
        "artifact-model": openai.languageModel("gpt-4o-mini"),
      },
    });
