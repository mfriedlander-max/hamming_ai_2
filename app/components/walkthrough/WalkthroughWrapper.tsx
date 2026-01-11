"use client";

import { Suspense } from "react";
import { WalkthroughProvider } from "./WalkthroughProvider";
import { SpotlightOverlay } from "./SpotlightOverlay";
import { HelpButton } from "./HelpButton";

export function WalkthroughWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WalkthroughProvider>
      {children}
      <SpotlightOverlay />
      <Suspense fallback={null}>
        <HelpButton />
      </Suspense>
    </WalkthroughProvider>
  );
}
