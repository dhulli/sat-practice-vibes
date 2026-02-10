"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { SplitPane } from "./SplitPane";
import { QuestionGridModal } from "./QuestionGridModal";

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

  // content
  leftPane?: React.ReactNode;   // used in split mode
  mainPane: React.ReactNode;    // used in single mode (stimulus+question stack)
  rightPane?: React.ReactNode;  // used in split mode

  // actions
  onJump: (index: number) => void;
  onBack: () => void;
  onNext: () => void;

  userLabel?: string;
};

export function ExamShell({
  title,
  layout,
  showTimer,
  timeText,
  totalQuestions,
  currentIndex,
  leftPane,
  rightPane,
  mainPane,
  onJump,
  onBack,
  onNext,
  userLabel,
}: Props) {
  const [gridOpen, setGridOpen] = useState(false);

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col">
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
        onNext={onNext}
        backDisabled={currentIndex <= 0}
        nextDisabled={currentIndex >= totalQuestions - 1}
      />

      <QuestionGridModal
        open={gridOpen}
        onClose={() => setGridOpen(false)}
        total={totalQuestions}
        currentIndex={currentIndex}
        onJump={onJump}
      />
    </div>
  );
}
