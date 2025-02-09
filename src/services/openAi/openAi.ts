import OpenAI from "openai";
import { inject, injectable } from "tsyringe";

import { getConfig } from "../../config";
import { Logger } from "../Logger";
import { AnswerModel, MessageModel, QuestionModel } from "../../models";
import { messageIsAnswer, messageIsQuestion } from "../../models/messageModel";

interface OpenAIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

@injectable()
export class OpenAIService {
  private hasInitBeenCalled = false;
  private apiKey: string | null = null;
  private apiUrl: string | null = null;
  private client: OpenAI | null = null;

  constructor(@inject("Logger") private logger: Logger) {}

  async init() {
    if (this.hasInitBeenCalled) {
      return;
    }
    this.hasInitBeenCalled = true;

    const config = await getConfig();

    this.apiKey = config.DEEPSEEK_API_KEY;
    this.apiUrl = config.DEEPSEEK_API_URL;
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.apiUrl,
    });
  }

  async ask(
    question: QuestionModel,
    history: MessageModel[] = [],
  ): Promise<Omit<AnswerModel, "_id">> {
    if (!this.hasInitBeenCalled) {
      throw new Error("OpenAIService has not been initialized");
    }

    if (!this.client) {
      throw new Error("OpenAIService has not been initialized");
    }
    const messages = history
      .map((h) => {
        if (messageIsQuestion(h)) {
          return {
            role: "user",
            content: h.question,
          };
        } else if (messageIsAnswer(h)) {
          return {
            role: "assistant",
            content: h.answer,
          };
        }
        return null;
      })
      .filter((m) => m !== null) as OpenAIChatMessage[];

    messages.push({
      role: "user",
      content: question.question,
    });

    const response = await this.client.chat.completions.create({
      model: "deepseek-reasoner",
      messages,
      stream: false,
    });

    return {
      chatId: question.chatId,
      precededBy: question._id.toString(),
      answer: response.choices[0].message.content,
      reasoning: response.choices[0].message.content,
      type: "ANSWER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
