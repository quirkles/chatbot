import { container } from "tsyringe";
import * as readline from "node:readline/promises";

import { ChatModel } from "../models";
import { ChatCrud, Logger } from "../services";
import { isYesAnswer } from "./utils";
import { select, Separator } from "@inquirer/prompts";

export async function selectChatOrCreate(
  chats: ChatModel[],
): Promise<ChatModel | null> {
  if (chats.length === 0) {
    const rl = readline.createInterface({
      output: process.stdout,
      input: process.stdin,
    });
    const answer = await rl.question(
      "No chats found. Create a new one? (y/n)?",
    );
    if (isYesAnswer(answer)) {
      return await createChat(rl);
    }
    rl.close();
    return null;
  }
  return selectChat(chats);
}

export async function createChat(rl: readline.Interface): Promise<ChatModel> {
  const chatCrud = container.resolve(ChatCrud);
  const logger = container.resolve<Logger>("Logger");

  const name = await rl.question("Chat name: ");
  const result = await chatCrud.create({
    chatName: name,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  if (result.isErr()) {
    logger.error("Error creating chat", {
      err: result.getErr(),
    });
    throw result.getErr();
  }
  rl.close();
  if (result.isOk()) {
    return result.unwrap();
  }
  throw new Error("Error creating chat");
}

export async function selectChat(
  chats: ChatModel[],
): Promise<ChatModel | null> {
  const logger = container.resolve<Logger>("Logger");

  const selected: null | string | "CREATE_NEW_CHAT" = await select({
    message: `Found ${chats.length} saved chat histories. Select an existing chat, start a new chat, or continue without creating a new chat`,
    choices: [
      {
        name: "Continue without creating a new chat.",
        value: null,
      },
      {
        name: "Start a new chat",
        value: "CREATE_NEW_CHAT",
      },
      new Separator(),
      ...chats.map((chat) => ({
        name: chat.chatName,
        value: chat.id,
      })),
    ],
  });

  if (!selected) {
    logger.error("Starting new chat");
    return null;
  }

  logger.debug("Selected chat", {
    chat: selected,
  });

  if (selected === "CREATE_NEW_CHAT") {
    return createChat(
      readline.createInterface({
        output: process.stdout,
        input: process.stdin,
      }),
    );
  }

  return chats.find((chat) => chat.id === selected)!;
}
