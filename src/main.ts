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
    console.error("Error fetching chats");
    console.error(chatsResult.unwrap());
  }

  const chats = chatsResult.unwrap();

  appLogger.debug("Fetched chats", { chats });

  await selectChatOrCreate(chats);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
