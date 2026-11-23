import React from 'react';

interface FormattedChatMessageProps {
  content: string;
  className?: string;
}

/**
 * Renders chat message text supporting:
 * - Bold: `**text**` or `*text*` (WhatsApp single-asterisk bold support)
 * - Italic: `_text_`
 * - Inline code / tags: `` `code` ``
 * - Line breaks: preserved
 */
export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  // Split lines to preserve paragraphs and line breaks cleanly
  const lines = content.split('\n');

  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matches:
    // 1. `**bold**`
    // 2. `*bold/italic*` (standard WhatsApp bold)
    // 3. `_italic_`
    // 4. `` `code` ``
    const tokens = text.split(/(\*\*.*?\*\*|\*[^*\n]+?\*|_[^_\n]+?_|`[^`\n]+?`)/g);

    return tokens.map((part, idx) => {
      if (!part) return null;

      // Double asterisk bold: **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={idx} className="font-bold text-inherit">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Single asterisk bold (WhatsApp standard): *text*
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <strong key={idx} className="font-bold text-inherit">
            {part.slice(1, -1)}
          </strong>
        );
      }

      // Single underscore italic: _text_
      if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
        return (
          <em key={idx} className="italic text-inherit">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Inline code: `code`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={idx} className="px-1 py-0.5 rounded bg-black/10 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {renderInline(line)}
          {lineIdx < lines.length - 1 && '\n'}
        </React.Fragment>
      ))}
    </div>
  );
};
