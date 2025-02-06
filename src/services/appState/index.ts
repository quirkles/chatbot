import { inject, singleton } from "tsyringe";

import { ChatModel, MessageModel } from "../../models";
import { createMapKeyedOn } from "../../utils";
import { deepMerge } from "../../utils/object";
import { MessageCrud } from "../mongo";

interface State {
  selectedChatId?: string;
  chats?: ChatModel[];
  selectedChatHistory?: MessageModel[];
}

@singleton()
export class AppState {
  private readonly state: State = {};
  constructor(
    @inject(MessageCrud) private messageCrud: MessageCrud,
    initialState: State = {},
  ) {
    this.state = initialState || {};
  }
  public get<T extends keyof State>(field: T): State[T] {
    return this.state[field];
  }
  public set<T extends keyof State>(field: T, value: State[T]): void {
    this.state[field] = value;
  }

  mergeChats(chats: ChatModel[]) {
    const chatMap = createMapKeyedOn(chats, "id");
    this.state.chats = (this.state.chats || []).reduce(
      (acc: ChatModel[], chat: ChatModel) => {
        const newChat = chatMap[chat.id];
        if (newChat) {
          acc.push(deepMerge(chat, newChat));
          delete chatMap[chat.id];
        } else {
          acc.push(chat);
        }
        return acc;
      },
      [],
    );
    this.state.chats.push(...Object.values(chatMap));
  }

  async fetchHistoryForSelectedChat(): Promise<void> {
    const selectedChatId = this.state.selectedChatId;
    if (!selectedChatId) {
      return;
    }
    this.messageCrud
      .fetchMany({
        filter: { chatId: selectedChatId },
      })
      .then((result) => {
        if (result.isOk()) {
          const threads = result.unwrap();
        }
      });
  }
}
