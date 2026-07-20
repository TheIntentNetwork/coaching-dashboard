"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownContent({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={`prose-brand font-body text-sm leading-relaxed text-on-surface sm:text-base ${className}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-on-surface">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h3 className="mb-2 font-headline text-xl text-on-surface">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-2 font-headline text-lg text-on-surface">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-2 font-headline text-base text-on-surface">{children}</h4>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface-container-low px-1.5 py-0.5 text-[0.9em]">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
