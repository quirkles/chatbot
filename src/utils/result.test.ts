import {describe, expect, it} from "@jest/globals";
import {Result} from "./result";

describe("Result Class", () => {
    describe("Static Methods", () => {
        describe("FromPromise", () => {

        })
        describe("WrapFn", () => {
            it("handles fn that throws", () => {
                const fnThatThrows = () => {
                    throw new Error("test error")
                }
                const wrappedFn = Result.WrapFn(fnThatThrows)
                const result = wrappedFn()
                expect(result.isErr()).toBe(true)
                expect(result.getErr()).toBeInstanceOf(Error)
                expect(result.getErr().message).toBe("test error")
            })

            it("handles fn with args that throws", () => {
                const fnWithArgsThatThrows = (a: number, b: number) => {
                    throw new Error(`Something is wrong with a:${a} and b:${b}`)
                }
                const wrappedFn = Result.WrapFn(fnWithArgsThatThrows)
                const result = wrappedFn(1, 2)
                expect(result.isErr()).toBe(true)
                expect(result.getErr()).toBeInstanceOf(Error)
                expect(result.getErr().message).toBe("Something is wrong with a:1 and b:2")
            })

            it("handles fn that returns a value", () => {
                const fnThatReturnsValue = () => {
                    return 1
                }
                const wrappedFn = Result.WrapFn(fnThatReturnsValue)
                const result = wrappedFn()
                expect(result.isOk()).toBe(true)
                expect(result.unwrap()).toBe(1)
                expect(result.getErr()).toBe(null)
            })


            it("handles fn with args that returns a value", () => {
              const fnWithArgsThatReturnsValue = (a: number, b: number) => {
                return a + b
              }
              const wrappedFn = Result.WrapFn(fnWithArgsThatReturnsValue)
              const result = wrappedFn(1, 2)
              expect(result.isOk()).toBe(true)
              expect(result.unwrap()).toBe(3)
              expect(result.getErr()).toBe(null)
            })
        })
    })
})