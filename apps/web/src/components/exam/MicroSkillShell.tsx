"use client";

import { TopBar } from "@/components/exam/TopBar";
import { SplitPane } from "@/components/exam/SplitPane";
import { Button } from "@/components/ui/button";

export function MicroSkillShell({
  title,
  userLabel,
  leftPane,
  rightPane,
  onExit,
}: {
  title: string;
  userLabel: string;
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  onExit: () => void;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <TopBar title={title} showTimer={false} />

      <div className="h-10 border-b bg-muted/20 px-4 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">{userLabel}</div>
        <Button variant="secondary" size="sm" onClick={onExit}>
          Exit
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <SplitPane storageKey="spv.micro.split.v1" left={leftPane} right={rightPane} />
      </div>
    </div>
  );
}
