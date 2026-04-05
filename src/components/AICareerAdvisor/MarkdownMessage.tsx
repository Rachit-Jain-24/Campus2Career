/**
 * MarkdownMessage — renders AI responses with proper formatting.
 * Converts markdown syntax to styled HTML without any external library.
 * Supports: bold, italic, bullet lists, numbered lists, inline code, line breaks.
 */

interface Props {
  content: string;
  isStreaming?: boolean;
}

/** Parse a single line's inline markdown: **bold**, *italic*, `code` */
function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Pattern: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }

    if (match[2] !== undefined) {
      // **bold**
      nodes.push(<strong key={match.index} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      // *italic*
      nodes.push(<em key={match.index} className="italic text-foreground/90">{match[3]}</em>);
    } else if (match[4] !== undefined) {
      // `code`
      nodes.push(
        <code key={match.index} className="bg-muted px-1.5 py-0.5 rounded text-[0.8em] font-mono text-primary">
          {match[4]}
        </code>
      );
    }
    last = match.index + match[0].length;
  }

  // Remaining plain text
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function MarkdownMessage({ content, isStreaming }: Props) {
  if (!content) {
    return isStreaming ? <span className="inline-block animate-pulse text-muted-foreground">▋</span> : null;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines — add spacing between blocks
    if (trimmed === '') {
      i++;
      continue;
    }

    // Heading: ### or ## or #
    if (/^#{1,3}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#{1,3})\s/)![1].length;
      const text = trimmed.replace(/^#{1,3}\s/, '');
      const cls = level === 1
        ? 'text-base font-bold text-foreground mt-3 mb-1'
        : level === 2
        ? 'text-sm font-bold text-foreground mt-2.5 mb-1'
        : 'text-sm font-semibold text-foreground/90 mt-2 mb-0.5';
      elements.push(<p key={i} className={cls}>{parseInline(text)}</p>);
      i++;
      continue;
    }

    // Bullet list: lines starting with - or * or •
    if (/^[-*•]\s/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*•]\s/, '');
        items.push(
          <li key={i} className="flex items-start gap-2 leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{parseInline(itemText)}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2 ml-1">
          {items}
        </ul>
      );
      continue;
    }

    // Numbered list: lines starting with 1. 2. etc.
    if (/^\d+\.\s/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      let num = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s/, '');
        items.push(
          <li key={i} className="flex items-start gap-2.5 leading-relaxed">
            <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
              {num}
            </span>
            <span>{parseInline(itemText)}</span>
          </li>
        );
        i++;
        num++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-2 my-2 ml-1">
          {items}
        </ol>
      );
      continue;
    }

    // Horizontal rule: ---
    if (/^---+$/.test(trimmed)) {
      elements.push(<hr key={i} className="border-border my-2" />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="leading-relaxed text-sm">
        {parseInline(trimmed)}
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-1.5 text-sm text-foreground">
      {elements}
      {isStreaming && (
        <span className="inline-block ml-0.5 animate-pulse text-primary">▋</span>
      )}
    </div>
  );
}
