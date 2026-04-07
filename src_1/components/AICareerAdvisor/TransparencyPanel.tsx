import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { TransparencyMeta } from '@/lib/ai/types';

interface TransparencyPanelProps {
  meta: TransparencyMeta;
  defaultExpanded?: boolean;
}

export function TransparencyPanel({ meta, defaultExpanded = false }: TransparencyPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const modelLabel =
    meta.modelUsed === 'local-fallback' ? 'Local Fallback' : 'VPA Engine';

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={expanded}
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Show Analysis Details
      </button>

      {expanded && (
        <div className="bg-muted/50 text-xs rounded-lg p-3 mt-2 space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Intent</span>
            <span className="font-medium">
              {meta.intent.replace(/_/g, ' ')} ({Math.round(meta.intentConfidence * 100)}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sentiment</span>
            <span className="font-medium capitalize">
              {meta.sentimentLabel} ({meta.sentimentScore.toFixed(2)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">RAG Chunks</span>
            <span className="font-medium">{meta.ragChunksRetrieved} retrieved</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Top Chunk</span>
            <span className="font-medium truncate max-w-[60%] text-right">{meta.topChunkTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Readiness Score</span>
            <span className="font-medium">{meta.placementReadinessScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model</span>
            <span className="font-medium">{modelLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
