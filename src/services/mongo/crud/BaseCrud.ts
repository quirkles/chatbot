import { inject } from "tsyringe";
import { ZodSchema } from "zod";
import { ObjectId } from "mongodb";

import { PromisedResult, Result } from "../../../utils/result";
import { Db } from "../Db";
import { BaseModel } from "../../../models";

export abstract class CrudBase<T extends BaseModel> {
  readonly collectionName: string;
  private readonly schema: ZodSchema<T>;

  protected constructor(
    @inject(Db) private db: Db,
    schema: ZodSchema<T>,
    collectionName: string,
  ) {
    this.collectionName = collectionName;
    this.schema = schema;
  }

  public async create(data: Omit<T, "_id">): Promise<Result<T, Error>> {
    const result = this.schema.safeParse({
      _id: new ObjectId(),
      ...data,
    });
    if (!result.success) {
      return Result.FromPromise(Promise.reject(result.error));
    }
    const item = result.data;
    return Result.FromPromise(
      this.db
        .getCollection(this.collectionName)
        .then((collection) => {
          return collection.insertOne(item);
        })
        .then((result) => {
          return this.schema.parse({
            ...item,
            id: result.insertedId.toString(),
          });
        }),
    );
  }

  public fetchOne(_id: string): PromisedResult<T> {
    return Result.FromPromise(
      this.db
        .getCollection(this.collectionName)
        .then((collection) => {
          return collection.findOne({ _id: new ObjectId(_id) });
        })
        .then((result) => {
          if (!result) {
            throw new Error(
              `No ${this.collectionName} document found with id ${_id}`,
            );
          }
          return this.schema.parse(result);
        }),
    );
  }

  public fetchMany(
    params: {
      filter?: Partial<T>;
      orderBy?: [keyof T, "asc" | "desc"];
      limit?: number;
      skip?: number;
    } = {},
  ): PromisedResult<T[]> {
    const { filter, orderBy, limit, skip } = params;
    return Result.FromPromise(
      this.db
        .getCollection(this.collectionName)
        .then((collection) => {
          let query = collection.find(filter || {});
          if (orderBy) {
            query = query.sort({ [orderBy[0]]: orderBy[1] });
          }
          if (limit) {
            query = query.limit(limit);
          }
          if (skip) {
            query = query.skip(skip);
          }
          return query.toArray();
        })
        .then((results) => {
          return results.map((result) => {
            return this.schema.parse(result);
          });
        }),
    );
  }
}
