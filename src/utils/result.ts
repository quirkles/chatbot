export class Result<T, E extends Error> {
  static async FromPromise<T, E extends Error>(
    promise: Promise<T>,
  ): Promise<Result<T, E>> {
    try {
      const value = await promise;
      return new Result<T, E>(value, null);
    } catch (err) {
      return new Result<T, E>(null, err as E);
    }
  }

  private readonly ok: T | null = null; // value
  private readonly err: E | null = null; // error

  constructor(ok: T | null, err: E | null) {
    if (!ok && !err) {
      throw new Error("Result must have a value or an error");
    }
    if (ok && err) {
      throw new Error("Result cannot have both a value and and error");
    }

    if (ok !== null) {
      this.ok = ok;
    } else {
      this.err = err as E;
    }
  }

  unwrap(): T {
    if (this.isOk()) {
      return this.ok as T;
    }

    if (this.isErr()) {
      throw this.err as E;
    }

    throw new Error("Result must have a value or an error");
  }

  expect(msg: string): T {
    if (this.isOk()) {
      return this.ok as T;
    }

    if (this.isErr()) {
      const err = this.err as E;
      throw (err.message = msg + ":\n " + err.message);
    }

    throw new Error(msg);
  }

  isOk(): this is Result<T, never> {
    return this.ok !== null;
  }

  isErr(): this is Result<never, E> {
    return this.err !== null;
  }

  getErr(): this extends Result<never, E> ? E : E | null {
    return this.err as E;
  }
}

export type PromisedResult<T> = Promise<Result<T, Error>>;
