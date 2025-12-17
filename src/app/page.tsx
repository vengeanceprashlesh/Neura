'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { LeftPanel, RightPanel } from '@/components/panels';

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Chat/Controls */}
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          maxSize={40}
          className="border-r border-zinc-800"
        >
          <LeftPanel />
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-zinc-800 hover:bg-indigo-500 transition-colors" />

        {/* Right Panel - Sandpack Editor & Preview */}
        <ResizablePanel defaultSize={75} minSize={50}>
          <RightPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
