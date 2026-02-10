export type QuestionStatus = "current" | "unanswered" | "answered" | "review";

export type AttemptState = {
  currentIndex: number;
  selected: Record<number, string>; // questionIndex -> choiceId or SPR text
  review: Record<number, boolean>;  // flagged
};

export function getStatus(
  i: number,
  s: AttemptState
): QuestionStatus {
  if (i === s.currentIndex) return "current";
  if (s.review[i]) return "review";
  if (s.selected[i] != null && String(s.selected[i]).trim() !== "") return "answered";
  return "unanswered";
}
