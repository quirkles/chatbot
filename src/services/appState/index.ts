import { inject, singleton } from "tsyringe";

import { ChatModel, MessageModel } from "../../models";
import { createMapKeyedOn } from "../../utils";
import { deepMerge } from "../../utils/object";
import { ChatCrud, MessageCrud } from "../mongo";
import { createMessageThreads } from "./utils/messages";

interface State {
  selectedChatId?: string;
  chats?: ChatModel[];
  selectedChatHistory?: MessageModel[];
  stdOutColumns: number;
}

@singleton()
export class AppState {
  private readonly state: State = {
    stdOutColumns: process.stdout.columns,
  };
  constructor(
    initialState: Partial<State> = {},

    @inject(MessageCrud) private messageCrud: MessageCrud,
    @inject(ChatCrud) private chatCrud: ChatCrud,
  ) {
    this.state = {
      ...this.state,
      ...initialState,
    };
  }
  public get<T extends keyof State>(field: T): State[T] {
    return this.state[field];
  }
  public set<T extends keyof State>(field: T, value: State[T]): void {
    this.state[field] = value;
  }

  mergeChats(chats: ChatModel[]) {
    const chatMap = createMapKeyedOn(chats, "_id");
    this.state.chats = (this.state.chats || []).reduce(
      (acc: ChatModel[], chat: ChatModel) => {
        const newChat = chatMap[chat._id.toString()];
        if (newChat) {
          acc.push(deepMerge(chat, newChat));
          delete chatMap[chat._id.toString()];
        } else {
          acc.push(chat);
        }
        return acc;
      },
      [],
    );
    this.state.chats.push(...Object.values(chatMap));
  }

  async populateMostRecentThreadInSelectedChatHistory(): Promise<void> {
    const selectedChatId = this.state.selectedChatId;
    if (!selectedChatId) {
      return;
    }
    return this.messageCrud
      .fetchMany({
        filter: { chatId: selectedChatId },
      })
      .then((result) => {
        if (result.isOk()) {
          const threads = createMessageThreads(result.unwrap());
          this.state.selectedChatHistory = threads[0];
        }
      });
  }

  async getSelectedChatName(): Promise<string | null> {
    const selectedChatId = this.state.selectedChatId;
    if (!selectedChatId) {
      return null;
    }
    const selectedChat = this.state.chats?.find(
      (chat) => chat._id.toString() === selectedChatId,
    );
    if (selectedChat) {
      return selectedChat.chatName;
    }
    return this.chatCrud.fetchOne(selectedChatId).then((result) => {
      if (result.isOk()) {
        const chat = result.unwrap();
        this.mergeChats([chat]);
        return chat.chatName;
      }
      return null;
    });
  }
}
