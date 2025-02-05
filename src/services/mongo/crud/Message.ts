import { inject, injectable } from "tsyringe";

import { messageModelSchema, MessageModel } from "../../../models";
import { Db } from "../Db";
import { CrudBase } from "./BaseCrud";

@injectable()
export class MessageCrud extends CrudBase<MessageModel> {
  constructor(@inject(Db) db: Db) {
    super(db, messageModelSchema, "messages");
  }
}
