import React from 'react';
import { markdownParser, ParsedContent } from '@/utils/markdownParser';

interface ParsedContentProps {
  content: string;
  className?: string;
}

export function ParsedContent({ content, className = "" }: ParsedContentProps) {
  const parsed: ParsedContent = markdownParser.parse(content);

  if (parsed.hasMarkdown) {
    return (
      <div 
        className={`prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: parsed.html }}
      />
    );
  }

  // Si pas de Markdown, afficher le texte brut avec préservation des sauts de ligne
  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {content}
    </div>
  );
}

// Composant pour le streaming
interface StreamingParsedContentProps {
  content: string;
  className?: string;
}

export function StreamingParsedContent({ content, className = "" }: StreamingParsedContentProps) {
  const parsed: ParsedContent = markdownParser.parseStreaming(content);

  if (parsed.hasMarkdown) {
    return (
      <div 
        className={`prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: parsed.html }}
      />
    );
  }

  // Si pas de Markdown, afficher le texte brut avec préservation des sauts de ligne
  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {content}
    </div>
  );
}
