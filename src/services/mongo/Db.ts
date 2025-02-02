import { singleton } from "tsyringe";
import { Collection, MongoClient } from "mongodb";

@singleton()
export class Db {
  private readonly connectionString: string;
  private client: MongoClient;
  constructor(mongoUrl: string, mongoDbName: string) {
    this.connectionString = `${mongoUrl}/${mongoDbName}`;
    this.client = new MongoClient(this.connectionString);
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async getCollection(collectionName: string): Promise<Collection> {
    return this.client.db().collection(collectionName);
  }
}
