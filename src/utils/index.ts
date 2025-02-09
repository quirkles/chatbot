import { KeysWithValsOfType } from "./type";
import { ObjectId } from "mongodb";

export const createMapKeyedOn = <
  T extends Record<string, unknown>,
  K extends KeysWithValsOfType<T, string | ObjectId>,
>(
  array: T[],
  key: K,
): Record<string, T> => {
  return array.reduce((map: Record<string, T>, item: T) => {
    let k = item[key];
    if (k instanceof ObjectId) {
      k = k.toString() as T[K];
    }
    if (!k) {
      throw new Error(
        `Missing key: ${String(key)} in item: ${JSON.stringify(item)}`,
      );
    }
    const exists = map[k as string];
    if (exists) {
      throw new Error(`Duplicate key: ${k}`);
    }
    map[k as string] = item;
    return map;
  }, {});
};
