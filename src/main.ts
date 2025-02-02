import "reflect-metadata";
import { container } from "tsyringe";

import { getConfig } from "./config";
import { initContainer } from "./container";
import { ChatCrud, type Logger } from "./services";
import { selectChatOrCreate } from "./prompts";

async function main(): Promise<void> {
  const config = await getConfig();
  await initContainer(config);

  const chatService = container.resolve<ChatCrud>(ChatCrud);
  const appLogger = container.resolve<Logger>("Logger");

  appLogger.info("Starting app");

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
    } else {
      appLogger.debug("No active chat selected");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
