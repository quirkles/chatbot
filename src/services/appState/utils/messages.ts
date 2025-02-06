import { MessageModel } from "../../../models";

export function createMessageThreads(
  messages: MessageModel[],
): MessageModel[][] {
  const [head, ...tail] = messages;
  const threads: MessageModel[][] = [];
  let thread: MessageModel[] = [head];
  while (tail.length > 0) {
    const { precededBy } = thread[0];
    const { id } = thread[thread.length - 1];
    const nextIndex = tail.findIndex((message) => message.precededBy === id);
    const priorIndex = tail.findIndex((message) => message.id === precededBy);

    if (nextIndex === -1 && priorIndex === -1) {
      threads.push(thread);
      thread = [tail.splice(0, 1)[0]];
    } else {
      if (nextIndex !== -1 && priorIndex !== -1) {
        if (nextIndex < priorIndex) {
          const prior = tail.splice(priorIndex, 1)[0];
          const next = tail.splice(nextIndex, 1)[0];
          thread.push(next);
          thread.unshift(prior);
        } else {
          const next = tail.splice(nextIndex, 1)[0];
          const prior = tail.splice(priorIndex, 1)[0];
          thread.push(next);
          thread.unshift(prior);
        }
      } else {
        if (nextIndex !== -1) {
          const next = tail.splice(nextIndex, 1)[0];
          thread.push(next);
        }
        if (priorIndex !== -1) {
          const prior = tail.splice(priorIndex, 1)[0];
          thread.unshift(prior);
        }
      }
    }
  }
  threads.push(thread);
  return threads.sort((a, b) => {
    return a[0].createdAt.getTime() - b[0].createdAt.getTime();
  });
}
