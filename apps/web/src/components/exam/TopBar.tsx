"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";


type Props = {
  title: string;
  showTimer?: boolean;
  timeText?: string;          // e.g., "28:00"
  onToggleDirections?: () => void;
};

export function TopBar({ title, showTimer, timeText, onToggleDirections }: Props) {
    const [isFs, setIsFs] = useState(false);
    useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    async function toggleFullScreen() {
        try {
            if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            } else {
            await document.exitFullscreen();
            }
        } catch {
            // ignore - browser may block
        }
    }
    return (
        <div className="h-14 border-b bg-muted/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
            <div className="font-semibold">{title}</div>
            <Button variant="ghost" className="text-sm" onClick={onToggleDirections}>
            Directions ▾
            </Button>
        </div>

        <div className="flex items-center gap-3">
            {showTimer ? (
            <div className="text-xl font-semibold tabular-nums">{timeText ?? "--:--"}</div>
            ) : (
            <div className="text-sm text-muted-foreground">Untimed</div>
            )}

            <Button variant="ghost" className="text-sm">Highlights & Notes</Button>
            <Button variant="ghost" className="text-sm">More</Button>
            <Button variant="ghost" className="text-sm" onClick={toggleFullScreen}>
                {isFs ? "Exit Full Screen" : "Enter Full Screen"}
            </Button>
        </div>
        </div>
    );
}
