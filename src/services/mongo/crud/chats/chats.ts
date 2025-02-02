import { inject, injectable } from "tsyringe";

import { chatModelSchema, ChatModel } from "../../../../models";
import { Db } from "../../Db";
import { CrudBase } from "../BaseCrud";

@injectable()
export class ChatCrud extends CrudBase<ChatModel> {
  constructor(@inject(Db) db: Db) {
    super(db, chatModelSchema, "chats");
  }
}
