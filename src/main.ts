import "reflect-metadata";
import { container } from "tsyringe";

import { getConfig } from "./config";
import { initContainer } from "./container";
import { AppState, ChatCrud, Logger } from "./services";
import { selectChatOrCreate } from "./prompts";
import { App } from "./app";

async function main(): Promise<void> {
  const config = await getConfig();
  await initContainer(config);

  const chatService = container.resolve<ChatCrud>(ChatCrud);
  const appLogger = container.resolve<Logger>("Logger");
  const appState = container.resolve(AppState);
  const app = container.resolve(App);

  appLogger.info("Starting app");

  await app.init();

  const chatsResult = await chatService.fetchMany();

  if (chatsResult.isErr()) {
    appLogger.error("Error fetching chats", {
      err: chatsResult.getErr(),
    });
    throw chatsResult.getErr();
  }

  if (chatsResult.isOk()) {
    const chats = chatsResult.unwrap();

    appLogger.debug("Fetched chats", { chats });

    const activeChat = await selectChatOrCreate(chats);

    if (activeChat) {
      appLogger.debug("Selected chat", { activeChat });
      appState.set("selectedChatId", activeChat._id.toString());
      await appState.populateMostRecentThreadInSelectedChatHistory();
    } else {
      appLogger.debug("No active chat selected");
    }

    appLogger.info("App started");

    app.displayCommands();

    while (true) {
      const result = await app.tick();
      if (result instanceof AbortSignal) {
        break;
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
