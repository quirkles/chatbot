import { container } from "tsyringe";

import { Config } from "./config";
import { Db } from "./services";
import { ChatCrud, AppState, createLogger } from "./services";
import { createWriteStream } from "node:fs";

export async function initContainer(config: Config): Promise<void> {
  const { MONGO_DB, MONGO_URL, LOGFILE_PATH } = config;
  container.register(Db, {
    useValue: new Db(MONGO_URL, MONGO_DB),
  });
  container.register(ChatCrud, { useClass: ChatCrud });
  container.register(AppState, { useValue: new AppState() });

  const logger = createLogger({
    level: "debug",
    outStream: createWriteStream(LOGFILE_PATH),
  });
  container.register("Logger", {
    useValue: logger,
  });
}
