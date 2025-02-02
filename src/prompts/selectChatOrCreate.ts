import { ChatModel } from "../models/chatModel";
import * as readline from "node:readline/promises";

export async function selectChatOrCreate(
  chats: ChatModel[],
): Promise<ChatModel | null> {
  const rl = readline.createInterface({
    output: process.stdout,
    input: process.stdin,
  });
  if (chats.length === 0) {
    console.log("asking");
    const answer = await rl.question(
      "No chats found. Create a new one? (y/n)?",
    );
    console.log("answer", answer);
    if (answer.trim().toLowerCase() === "y") {
      return await createChat(rl);
    }
    rl.close();
    return null;
  }
  return await selectChat(rl, chats);
}

export async function createChat(rl: readline.Interface): Promise<ChatModel> {
  const name = await rl.question("Chat name: ");
  console.log(`Created chat ${name}`);
  rl.close();
  return { chatName: name } as ChatModel;
}

export async function selectChat(
  rl: readline.Interface,
  chats: ChatModel[],
): Promise<ChatModel> {
  const answer = await rl.question(`Select chat (1-${chats.length}): `);
  const index = parseInt(answer) - 1;
  console.log(`Selected chat ${chats[index].chatName}`);
  rl.close();
  return chats[index];
}
