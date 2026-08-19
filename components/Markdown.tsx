"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="mb-2 last:mb-0" {...props} />,
        ul: (props) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
        ol: (props) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
        li: (props) => <li className="leading-relaxed" {...props} />,
        strong: (props) => <strong className="font-semibold text-slate-900" {...props} />,
        em: (props) => <em className="italic" {...props} />,
        h1: (props) => <h3 className="mt-3 mb-1 text-base font-semibold first:mt-0" {...props} />,
        h2: (props) => <h3 className="mt-3 mb-1 text-base font-semibold first:mt-0" {...props} />,
        h3: (props) => <h4 className="mt-3 mb-1 text-sm font-semibold first:mt-0" {...props} />,
        a: (props) => (
          <a
            className="font-medium text-teal-700 underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
            {...props}
          />
        ),
        blockquote: (props) => (
          <blockquote
            className="mb-2 border-l-4 border-teal-200 pl-3 text-slate-600 italic"
            {...props}
          />
        ),
        hr: () => <hr className="my-3 border-slate-200" />,
        pre: (props) => (
          <pre
            className="mb-2 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs leading-relaxed text-slate-100"
            {...props}
          />
        ),
        code: ({ className, children, ...rest }) => {
          const isBlock = typeof className === "string" && className.startsWith("language-");
          if (isBlock) {
            return (
              <code className={`${className} font-mono`} {...rest}>
                {children}
              </code>
            );
          }
          return (
            <code
              className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[0.85em] text-slate-900"
              {...rest}
            >
              {children}
            </code>
          );
        },
        table: (props) => (
          <div className="mb-2 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm" {...props} />
          </div>
        ),
        th: (props) => (
          <th className="border-b border-slate-300 px-2 py-1 font-semibold" {...props} />
        ),
        td: (props) => <td className="border-b border-slate-200 px-2 py-1" {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
