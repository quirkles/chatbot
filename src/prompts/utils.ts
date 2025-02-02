const answersMeaningYes = [
  "y",
  "yes",
  "sure",
  "ok",
  "okay",
  "yup",
  "yep",
  "yeh",
];

export function isYesAnswer(answer: string): boolean {
  return answersMeaningYes.includes(answer.trim().toLowerCase());
}

const answersMeaningNo = ["n", "no", "nope", "nah"];

export function isNoAnswer(answer: string): boolean {
  return answersMeaningNo.includes(answer.trim().toLowerCase());
}
