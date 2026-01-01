"use client";

import { Button } from "@/components/ui/button";

interface AcceptRejectControlsProps {
  onAccept: () => void;
  onReject: () => void;
}

export function AcceptRejectControls({
  onAccept,
  onReject,
}: AcceptRejectControlsProps) {
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={onAccept}>
        Accept
      </Button>
      <Button size="sm" variant="outline" onClick={onReject}>
        Reject
      </Button>
    </div>
  );
}
