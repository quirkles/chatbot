import { ChatModel } from "../../models";
import { singleton } from "tsyringe";
import { createMapKeyedOn } from "../../utils";
import {deepMerge} from "../../utils/object";

interface State {
  selectedChatId?: ChatModel;
  chats?: ChatModel[];
}

@singleton()
export class AppState {
  private readonly state: State = {};
  constructor(initialState?: State) {
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
}
