import {describe, expect, it} from "@jest/globals";
import {add, sub} from "date-fns";

import {MessageModel} from "../../../models";
import {createMessageThreads} from "./messages";
import {shuffle} from "../../../utils/array";

describe("messages", () => {
    describe("createMessageThreads", () => {
        it('should create thread from messages with linear dependencies', () => {
            const messages: MessageModel[] = [
                {
                    id: '1',
                    type: 'QUESTION',
                    chatId: 'chat1',
                    question: 'First question',
                    precededBy: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '2',
                    type: 'ANSWER',
                    chatId: 'chat1',
                    answer: 'First answer',
                    reasoning: 'Because',
                    precededBy: '1',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '3',
                    type: 'QUESTION',
                    chatId: 'chat1',
                    question: 'Second question',
                    precededBy: '2',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '4',
                    type: 'ANSWER',
                    chatId: 'chat1',
                    answer: 'Second answer',
                    reasoning: 'Because',
                    precededBy: '3',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '5',
                    type: 'QUESTION',
                    chatId: 'chat1',
                    question: 'Third question',
                    precededBy: '4',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '6',
                    type: 'ANSWER',
                    chatId: 'chat1',
                    answer: 'Third answer',
                    reasoning: 'Because',
                    precededBy: '5',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            for (let i = 0; i < 50; i++) {
                const threads = createMessageThreads(
                    shuffle(messages)
                );

                expect(threads).toHaveLength(1);
                expect(threads[0]).toHaveLength(6);
                expect(threads[0][0].id).toBe('1');
                expect(threads[0][1].id).toBe('2');
                expect(threads[0][2].id).toBe('3');
                expect(threads[0][3].id).toBe('4');
                expect(threads[0][4].id).toBe('5');
                expect(threads[0][5].id).toBe('6');
            }

        });
        it('should create threads from messages with linear dependencies', () => {
            const baseDate = sub(new Date(), {days: 1});
            const messages: MessageModel[] = [
                {
                    id: '1',
                    type: 'QUESTION',
                    chatId: 'chat1',
                    question: 'First question',
                    precededBy: null,
                    createdAt: add(new Date(), {seconds: 1}),
                    updatedAt: new Date()
                },
                {
                    id: '2',
                    type: 'ANSWER',
                    chatId: 'chat1',
                    answer: 'First answer',
                    reasoning: 'Because',
                    precededBy: '1',
                    createdAt: add(new Date(), {seconds: 2}),
                    updatedAt: new Date()
                },
                {
                    id: '4',
                    type: 'ANSWER',
                    chatId: 'chat1',
                    answer: 'Second answer',
                    reasoning: 'Because',
                    precededBy: '3',
                    createdAt: add(new Date(), {seconds: 3}),
                    updatedAt: new Date()
                },
                {
                    id: '5',
                    type: 'QUESTION',
                    chatId: 'chat1',
                    question: 'Third question',
                    precededBy: '4',
                    createdAt: add(new Date(), {seconds: 4}),
                    updatedAt: new Date()
                },
                {
                    id: '6',
                    type: 'ANSWER',
                    chatId: 'chat1',
                    answer: 'Third answer',
                    reasoning: 'Because',
                    precededBy: '5',
                    createdAt: add(new Date(), {seconds: 5}),
                    updatedAt: new Date()
                }
            ];

            for (let i = 0; i < 50; i++) {
                const threads = createMessageThreads(
                    shuffle(messages)
                );

                expect(threads).toHaveLength(2);
                expect(threads[0]).toHaveLength(2);
                expect(threads[1]).toHaveLength(3);
                expect(threads[0][0].id).toBe('1');
                expect(threads[0][1].id).toBe('2');
                expect(threads[1][0].id).toBe('4');
                expect(threads[1][1].id).toBe('5');
                expect(threads[1][2].id).toBe('6');
            }
        });
    });
});