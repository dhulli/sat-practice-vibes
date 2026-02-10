"use client";

import { useMemo, useState } from "react";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { SplitPane } from "./SplitPane";
import { QuestionGridModal, type QuestionStatus } from "./QuestionGridModal";

type LayoutMode = "split" | "single";

type Props = {
  title: string;
  layout: LayoutMode;

  // timer
  showTimer?: boolean;
  timeText?: string;

  // question counts
  totalQuestions: number;
  currentIndex: number; // 0-based

  // NEW: statuses for grid modal
  statuses?: QuestionStatus[];

  // content
  leftPane?: React.ReactNode;   // used in split mode
  mainPane: React.ReactNode;    // used in single mode (stimulus+question stack)
  rightPane?: React.ReactNode;  // used in split mode

  // actions
  onJump: (index: number) => void;
  onBack: () => void;
  onNext: () => void;

  // submit (optional; used when last Next opens modal)
  onSubmit?: () => void;

  userLabel?: string;
};

export function ExamShell({
  title,
  layout,
  showTimer,
  timeText,
  totalQuestions,
  currentIndex,
  statuses,
  leftPane,
  rightPane,
  mainPane,
  onJump,
  onBack,
  onNext,
  onSubmit,
  userLabel,
}: Props) {
  const [gridOpen, setGridOpen] = useState(false);

  const isLast = currentIndex >= totalQuestions - 1;

  const effectiveStatuses = useMemo(() => {
    // If caller provides statuses, use them; otherwise basic default.
    if (statuses && statuses.length === totalQuestions) return statuses;
    return Array.from({ length: totalQuestions }, (_, i) =>
      i === currentIndex ? ("current" as const) : ("unanswered" as const)
    );
  }, [statuses, totalQuestions, currentIndex]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <TopBar
        title={title}
        showTimer={showTimer}
        timeText={timeText}
        onToggleDirections={() => {
          // later: slide-down directions panel
        }}
      />

      {/* Main area */}
      <div className="flex-1 min-h-0">
        {layout === "split" ? (
          <SplitPane
            storageKey="spv.rw.split.v1"
            left={leftPane ?? <div className="p-6 text-muted-foreground">No passage</div>}
            right={rightPane ?? <div className="p-6 text-muted-foreground">No question</div>}
          />
        ) : (
          <div className="h-full overflow-auto">
            <div className="max-w-4xl mx-auto p-4">{mainPane}</div>
          </div>
        )}
      </div>

      <BottomBar
        userLabel={userLabel}
        current={currentIndex + 1}
        total={totalQuestions}
        onOpenGrid={() => setGridOpen(true)}
        onBack={onBack}
        onNext={() => {
          // NEW: last question Next opens grid modal (check your work + submit)
          if (isLast) setGridOpen(true);
          else onNext();
        }}
        backDisabled={currentIndex <= 0}
        // NEW: Next is never disabled; last question Next opens modal
        nextDisabled={false}
      />

      <QuestionGridModal
        open={gridOpen}
        onClose={() => setGridOpen(false)}
        total={totalQuestions}
        currentIndex={currentIndex}
        onJump={onJump}
        statuses={effectiveStatuses}
        showSubmit={isLast}
        onSubmit={() => {
          // for now mock submit if not provided
          if (onSubmit) onSubmit();
          else alert("Submit Section (mock)");
          setGridOpen(false);
        }}
      />
    </div>
  );
}
