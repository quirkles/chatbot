import OpenAI from "openai";
import { inject, injectable } from "tsyringe";

import { getConfig } from "../../config";
import { QuestionModel } from "../../models/questionModel";
import { AnswerModel } from "../../models/answerModel";
import { Logger } from "../Logger";
import { AppState } from "../appState";

@injectable()
export class OpenAIService {
  private hasInitBeenCalled = false;
  private apiKey: string | null = null;
  private apiUrl: string | null = null;
  private client: OpenAI | null = null;

  constructor(
    @inject("Logger") private logger: Logger,
    @inject(AppState) private appState: AppState,
  ) {}

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

  async ask(question: string): Promise<AnswerModel> {
    if (!this.hasInitBeenCalled) {
      throw new Error("OpenAIService has not been initialized");
    }
    throw new Error("Not implemented");
  }
}
