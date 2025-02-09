import readline from "node:readline/promises";
import { inject, singleton } from "tsyringe";

import { ALogger, AppState, ChatCrud, MessageCrud } from "../services";
import { AnswerModel, QuestionModel } from "../models";
import { OpenAIService } from "../services/openAi/openAi";
import chalk from "chalk";

@singleton()
export class App {
  constructor(
    @inject(AppState) private appState: AppState,
    @inject("Logger") private logger: ALogger,
    @inject(OpenAIService) private openAIService: OpenAIService,
    @inject(MessageCrud) private messageCrud: MessageCrud,
    @inject(ChatCrud) private chatCrud: ChatCrud,
  ) {
    this.logger.info("Starting app");

    const selectedChatId = this.appState.get("selectedChatId");
    if (selectedChatId) {
      this.logger.info("Selected chat", { selectedChatId });
    }
  }

  async init(): Promise<void> {
    await this.openAIService.init();
  }
  async ask(questionString: string): Promise<AnswerModel> {
    const question: Omit<QuestionModel, "_id"> = {
      type: "QUESTION",
      question: questionString,
      createdAt: new Date(),
      updatedAt: new Date(),
      precededBy: null,
      chatId: this.appState.get("selectedChatId") || null,
    };

    const activeHistory = this.appState.get("selectedChatHistory");

    if (activeHistory && activeHistory.length > 0) {
      question.precededBy =
        activeHistory[activeHistory.length - 1]._id.toString();
    }

    const savedQuestion = await this.messageCrud.create(question);

    if (savedQuestion.isErr()) {
      this.logger.error("Error saving message", {
        err: savedQuestion.getErr(),
      });
      throw savedQuestion.getErr();
    }

    if (!savedQuestion.isOk()) {
      this.logger.error("Error saving message", {
        err: savedQuestion.getErr(),
      });
      throw savedQuestion.getErr();
    }

    const message = savedQuestion.unwrap();

    if (message.type !== "QUESTION") {
      throw new Error("Unexpected message type from save question");
    }

    const answer = await this.openAIService.ask(message, activeHistory);

    const savedAnswerResult = await this.messageCrud.create(answer);

    if (savedAnswerResult.isOk()) {
      const savedAnswer = savedAnswerResult.unwrap();
      if (savedAnswer.type === "ANSWER") {
        return savedAnswer;
      }
      throw new Error("Unexpected message type from save answer");
    }
    this.logger.error("Error saving message", {
      err: savedAnswerResult.getErr(),
    });
    throw savedAnswerResult.getErr();
  }

  displayCommands() {
    console.log("Commands:");
    console.log("exit - exit the app");
    console.log("help - show this help");
    console.log("new chat - create a new chat");
    console.log("select chat - select an existing chat");
    console.log("show history - show the history for the current chat");
  }

  async tick(): Promise<void | AbortSignal> {
    const rl = readline.createInterface({
      output: process.stdout,
      input: process.stdin,
    });
    const command = await rl.question(
      `(${(await this.appState.getSelectedChatName()) || "No chat selected"}): `,
    );
    rl.close();
    switch (command) {
      case "exit":
        this.logger.info("Exiting app");
        return AbortSignal.abort();
      case "help":
        this.displayCommands();
        break;
      case "history":
        if (this.appState.get("selectedChatHistory")?.length || 0 > 0) {
          console.log(
            this.appState
              .get("selectedChatHistory")
              ?.slice(0, 5)
              .map((message) => {
                if (message.type === "ANSWER") {
                  return `Answer > ${chalk.green(message.answer)}`;
                }
                return `Question > ${chalk.blue(message.question)}`;
              })
              .join(`\n${"-".repeat(this.appState.get("stdOutColumns"))}\n`),
          );
        } else {
          console.log("No history found");
        }
        break;
      default:
        await this.ask(command)
          .then((answer) => {
            console.log(
              "\n" + "-".repeat(this.appState.get("stdOutColumns")) + "\n",
            );
            console.log(chalk.green(answer.answer));
          })
          .catch((err) => {
            console.log(err);
            this.logger.error("Error asking question", {
              err,
            });
            console.log("Oops, something went wrong!");
          });
    }
  }
}
