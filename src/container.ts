import { createWriteStream } from "node:fs";
import { container } from "tsyringe";

import { Config } from "./config";
import { Db, MessageCrud } from "./services";
import { ChatCrud, AppState, createLogger } from "./services";
import { App } from "./app";
import { OpenAIService } from "./services/openAi/openAi";

export async function initContainer(config: Config): Promise<void> {
  const { MONGO_DB, MONGO_URL, LOGFILE_PATH } = config;

  const logger = createLogger({
    level: "debug",
    outStream: createWriteStream(LOGFILE_PATH),
  });

  container.register("Logger", {
    useValue: logger,
  });

  container.register(OpenAIService, {
    useClass: OpenAIService,
  });

  container.register(Db, {
    useValue: new Db(MONGO_URL, MONGO_DB),
  });

  // Register CRUD classes
  container.register(ChatCrud, { useClass: ChatCrud });
  container.register(MessageCrud, { useClass: MessageCrud });

  container.register(AppState, {
    useValue: new AppState(
      {},
      container.resolve(MessageCrud),
      container.resolve(ChatCrud),
    ),
  });

  container.register(App, {
    useFactory: (dependencyContainer) =>
      new App(
        dependencyContainer.resolve(AppState),
        dependencyContainer.resolve("Logger"),
        dependencyContainer.resolve(OpenAIService),
        dependencyContainer.resolve(MessageCrud),
        dependencyContainer.resolve(ChatCrud),
      ),
  });
}
