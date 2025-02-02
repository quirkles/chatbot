import { z } from "zod";
import path from "node:path";
import * as fs from "node:fs";
import { createInterface } from "node:readline";

const DEFAULT_MONGO_URL = "mongodb://localhost:27017";
const DEFAULT_MONGO_DB = "com_quirkles_chatbot";

const LOGFILE_PATH = path.join(
  __dirname,
  "..",
  "logs",
  String(Date.now()),
  "app.log",
);

const configSchema = z.object({
  MONGO_URL: z.string().url().default(DEFAULT_MONGO_URL),
  MONGO_DB: z.string().default(DEFAULT_MONGO_DB),

  DEEPSEEK_API_KEY: z.string(),
  DEEPSEEK_API_URL: z.string(),
  DEEPSEEK_MODEL: z.string(),
  LOGFILE_PATH: z.string().default(LOGFILE_PATH),
});

export type Config = z.infer<typeof configSchema>;

const config: Config | null = null;
// Read the file line by line
export async function getConfig(): Promise<Config> {
  if (config) {
    return config;
  } else {
    return initConfig();
  }
}

const envPath = path.join(__dirname, "..", ".env");

const keyValueRegex = /^\s*(?<key>[A-Za-z1-9_]+)=(?<value>.*)\s*$/;
async function initConfig(): Promise<Config> {
  // If the file doesn't exist, throw an error
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env file not found at ${envPath}`);
  }
  const fileStream = fs.createReadStream(envPath);

  // Read the file line by line
  const rl = createInterface({
    input: fileStream,
  });

  const partialConfig: Record<string, string> = {};

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    const match = line.match(keyValueRegex);
    if (match) {
      const { key, value } = match.groups!;
      if (key && value) {
        partialConfig[key] = value;
      }
    }
  }

  const parsedConfig = configSchema.parse(partialConfig);

  if (!fs.existsSync(parsedConfig.LOGFILE_PATH)) {
    fs.mkdirSync(path.dirname(parsedConfig.LOGFILE_PATH), { recursive: true });
  }

  return parsedConfig;
}
