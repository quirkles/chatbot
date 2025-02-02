import { inject } from "tsyringe";
import { ZodSchema } from "zod";

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

  public fetchOne(id: string): PromisedResult<T> {
    return Result.FromPromise(
      this.db
        .getCollection(this.collectionName)
        .then((collection) => {
          return collection.findOne({ id });
        })
        .then((result) => {
          if (!result) {
            throw new Error(
              `No ${this.collectionName} document found with id ${id}`,
            );
          }
          return this.schema.parse(result);
        }),
    );
  }

  public fetchMany(
    params: {
      filter: Partial<T>;
      orderBy: [keyof T, "asc" | "desc"];
      limit: number;
      skip: number;
    } = {
      filter: {},
      orderBy: ["createdAt", "desc"],
      limit: 10,
      skip: 0,
    },
  ): PromisedResult<T[]> {
    return Result.FromPromise(
      this.db
        .getCollection(this.collectionName)
        .then((collection) => {
          return collection
            .find(params.filter)
            .sort({ [params.orderBy[0]]: params.orderBy[1] })
            .limit(params.limit)
            .skip(params.skip)
            .toArray();
        })
        .then((results) => {
          return results.map((result) => {
            return this.schema.parse(result);
          });
        }),
    );
  }
}
