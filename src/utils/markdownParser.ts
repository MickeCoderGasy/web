// Parser Markdown simple pour les réponses Grok
// Convertit le Markdown en HTML pendant le streaming

export interface ParsedContent {
  html: string;
  hasMarkdown: boolean;
}

export class MarkdownParser {
  private static instance: MarkdownParser;
  
  static getInstance(): MarkdownParser {
    if (!MarkdownParser.instance) {
      MarkdownParser.instance = new MarkdownParser();
    }
    return MarkdownParser.instance;
  }

  /**
   * Parse le contenu Markdown en HTML
   */
  parse(content: string): ParsedContent {
    let html = content;
    let hasMarkdown = false;

    // Détecter si le contenu contient du Markdown
    if (this.containsMarkdown(content)) {
      hasMarkdown = true;
      
      // Parser les éléments Markdown
      html = this.parseHeaders(html);
      html = this.parseBold(html);
      html = this.parseItalic(html);
      html = this.parseInlineCode(html);
      html = this.parseCodeBlocks(html);
      html = this.parseLists(html);
      html = this.parseBlockquotes(html);
      html = this.parseTables(html);
      html = this.parseLineBreaks(html);
    }

    return { html, hasMarkdown };
  }

  /**
   * Parse en temps réel pendant le streaming
   */
  parseStreaming(content: string): ParsedContent {
    // Pour le streaming, on parse de manière plus simple
    let html = content;
    let hasMarkdown = false;

    if (this.containsMarkdown(content)) {
      hasMarkdown = true;
      
      // Parser seulement les éléments de base pour le streaming
      html = this.parseHeaders(html);
      html = this.parseBold(html);
      html = this.parseItalic(html);
      html = this.parseInlineCode(html);
    }

    return { html, hasMarkdown };
  }

  private containsMarkdown(content: string): boolean {
    const markdownPatterns = [
      /#{1,6}\s/,           // Headers
      /\*\*.*?\*\*/,        // Bold
      /\*.*?\*/,            // Italic
      /`.*?`/,               // Inline code
      /```[\s\S]*?```/,      // Code blocks
      /^\s*[-*+]\s/,         // Lists
      /^\s*\d+\.\s/,        // Numbered lists
      /^>\s/,                // Blockquotes
      /\|.*\|/               // Tables
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
  }

  private parseHeaders(content: string): string {
    // Headers H1-H6
    return content
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-foreground mb-3 mt-4">$1</h4>')
      .replace(/^##### (.*$)/gim, '<h5 class="text-base font-medium text-foreground mb-2 mt-3">$1</h5>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-foreground mb-4 mt-5">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-foreground mb-4 mt-6">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-foreground mb-5 mt-6">$1</h1>');
  }

  private parseBold(content: string): string {
    // Bold text
    return content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  }

  private parseItalic(content: string): string {
    // Italic text
    return content.replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>');
  }

  private parseInlineCode(content: string): string {
    // Inline code
    return content.replace(/`([^`]+)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-primary">$1</code>');
  }

  private parseCodeBlocks(content: string): string {
    // Code blocks
    return content.replace(/```([\s\S]*?)```/g, '<pre class="bg-secondary/50 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>');
  }

  private parseLists(content: string): string {
    // Unordered lists
    content = content.replace(/^[\s]*[-*+]\s+(.*)$/gim, '<li class="ml-4 mb-1">$1</li>');
    
    // Numbered lists
    content = content.replace(/^[\s]*\d+\.\s+(.*)$/gim, '<li class="ml-4 mb-1">$1</li>');
    
    // Wrap consecutive list items in ul/ol
    content = content.replace(/(<li class="ml-4 mb-1">.*<\/li>)/gs, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>');
    
    return content;
  }

  private parseBlockquotes(content: string): string {
    // Blockquotes
    return content.replace(/^>\s*(.*)$/gim, '<blockquote class="border-l-4 border-primary/30 pl-4 py-2 my-3 bg-primary/5 italic text-muted-foreground">$1</blockquote>');
  }

  private parseTables(content: string): string {
    // Simple table parsing
    const lines = content.split('\n');
    let inTable = false;
    let tableHtml = '';
    let result = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('|') && line.trim().length > 0) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border border-border/50 rounded-lg">';
        }
        
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
        
        if (cells.length > 0) {
          if (i > 0 && lines[i-1].includes('|') && lines[i-1].includes('-')) {
            // Header row
            tableHtml += '<thead><tr class="bg-secondary/50">';
            cells.forEach(cell => {
              tableHtml += `<th class="px-4 py-2 text-left font-medium text-sm border-b border-border/50">${cell}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';
          } else {
            // Data row
            tableHtml += '<tr class="hover:bg-secondary/20">';
            cells.forEach(cell => {
              tableHtml += `<td class="px-4 py-2 text-sm border-b border-border/30">${cell}</td>`;
            });
            tableHtml += '</tr>';
          }
        }
      } else {
        if (inTable) {
          tableHtml += '</tbody></table></div>';
          result += tableHtml;
          tableHtml = '';
          inTable = false;
        }
        result += line + '\n';
      }
    }

    if (inTable) {
      tableHtml += '</tbody></table></div>';
      result += tableHtml;
    }

    return result || content;
  }

  private parseLineBreaks(content: string): string {
    // Convert line breaks to <br> and preserve paragraphs
    return content
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p class="mb-3">')
      .replace(/$/, '</p>');
  }
}

// Instance singleton
export const markdownParser = MarkdownParser.getInstance();
