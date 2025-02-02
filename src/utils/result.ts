export class Result<T, E extends Error> {
  static async FromPromise<T, E extends Error>(
    promise: Promise<T>,
  ): Promise<Result<T, E>> {
    try {
      const value = await promise;
      return new Result<T, never>(value, null);
    } catch (err) {
      return new Result<never, E>(null, err as E);
    }
  }

  static WrapFn<
    F extends (...args: Parameters<F>) => ReturnType<F>,
    E extends Error,
  >(fn: F): (...args: Parameters<F>) => Result<ReturnType<F>, E> {
    return (...args: Parameters<F>): Result<ReturnType<F>, E> => {
      try {
        return new Result<ReturnType<F>, never>(fn(...args), null);
      } catch (err) {
        return new Result<never, E>(null, err as E);
      }
    };
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

  unwrap(this: Result<T, E>): this extends Result<T, never> ? T : T | E {
    if (this.isOk()) {
      return this.ok as T;
    }

    if (this.isErr()) {
      throw this.getErr();
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

  isOk(this: Result<T, E>): this is Result<T, never> {
    return this.ok !== null;
  }

  isErr(this: Result<T, E>): this is Result<never, E> {
    return this.err !== null;
  }

  getErr(this: Result<T, E>): this extends Result<never, E> ? E : E | null {
    return this.err as E;
  }
}

export type PromisedResult<T> = Promise<Result<T, Error>>;
