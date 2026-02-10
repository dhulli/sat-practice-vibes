"use client";

import { TopBar } from "@/components/exam/TopBar";
import { SplitPane } from "@/components/exam/SplitPane";

export function MicroSkillShell({
  title,
  userLabel,
  leftPane,
  rightPane,
}: {
  title: string;
  userLabel: string;
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <TopBar title={title} showTimer={false} />
      {/* lightweight subheader row for username */}
      <div className="h-10 border-b bg-muted/20 px-4 flex items-center justify-end text-sm text-muted-foreground">
        {userLabel}
      </div>

      <div className="flex-1 min-h-0">
        <SplitPane storageKey="spv.micro.split.v1" left={leftPane} right={rightPane} />
      </div>
    </div>
  );
}
