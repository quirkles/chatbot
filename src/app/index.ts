import readline from "node:readline/promises";
import { inject, singleton } from "tsyringe";


import { ALogger, AppState } from "../services";

@singleton()
export class App {
  constructor(
    @inject(AppState) private appState: AppState,
    @inject("Logger") private logger: ALogger,
  ) {
    this.logger.info("Starting app");

    const selectedChatId = this.appState.get("selectedChatId");
    if (selectedChatId) {
      this.logger.info("Selected chat", { selectedChatId });
    }
  }
  async ask(question: string): Promise<void> {

  }

  async tick(): Promise<void | AbortSignal> {
    console.log("tick");
    const rl = readline.createInterface({
      output: process.stdout,
      input: process.stdin,
    });
    const command = await rl.question("> ");
    rl.close();
    switch (command) {
      case "exit":
        this.logger.info("Exiting app");
        return AbortSignal.abort();
      default:
        await this.ask(command);
        return;
    }
  }
}
