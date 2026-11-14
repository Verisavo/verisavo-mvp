import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Assistant answers are Markdown (see the format rules in lib/server/assistant/answer.ts), shown in the chat and in
// saved conversations. Safe by construction: raw HTML in the text is shown as text, never rendered; react-markdown's
// URL check drops javascript: and similar links; images are dropped. The closing "Sources:" line becomes a footer.
// dark: styles only apply inside the assistant's .theme-dark area.

const heading = "m-0 text-[15.5px] leading-[1.35] font-semibold text-ink dark:text-white";
const components: Components = {
  h1: ({ node: _n, ...p }) => <h3 className={heading} {...p} />,
  h2: ({ node: _n, ...p }) => <h3 className={heading} {...p} />,
  h3: ({ node: _n, ...p }) => <h3 className={heading} {...p} />,
  h4: ({ node: _n, ...p }) => <h4 className="m-0 text-[14.4px] font-semibold text-ink dark:text-white" {...p} />,
  p: ({ node: _n, ...p }) => <p className="m-0" {...p} />,
  ul: ({ node: _n, ...p }) => <ul className="m-0 grid list-disc gap-1.5 pl-5 marker:text-brand-400" {...p} />,
  ol: ({ node: _n, ...p }) => <ol className="m-0 grid list-decimal gap-1.5 pl-5 marker:font-semibold marker:text-brand-600 dark:marker:text-brand-300" {...p} />,
  li: ({ node: _n, ...p }) => <li className="pl-1 [&>ol]:mt-1.5 [&>p+p]:mt-1.5 [&>ul]:mt-1.5" {...p} />,
  strong: ({ node: _n, ...p }) => <strong className="font-semibold text-ink dark:text-white" {...p} />,
  a: ({ node: _n, ...p }) => <a className="font-medium text-brand-700 underline underline-offset-2 dark:text-brand-200" target="_blank" rel="noopener noreferrer nofollow" {...p} />,
  table: ({ node: _n, ...p }) => (
    <div className="overflow-x-auto rounded-xl border border-brand-200 dark:border-[rgba(168,198,232,.2)]">
      <table className="w-full border-collapse text-left text-[13.5px] leading-[1.45]" {...p} />
    </div>
  ),
  thead: ({ node: _n, ...p }) => <thead className="bg-brand-100/70 dark:bg-[rgba(168,198,232,.1)]" {...p} />,
  th: ({ node: _n, ...p }) => <th className="border-b border-brand-200 px-3 py-2 font-semibold whitespace-nowrap text-ink dark:border-[rgba(168,198,232,.2)] dark:text-white" {...p} />,
  td: ({ node: _n, ...p }) => <td className="border-b border-brand-200/70 px-3 py-2 align-top dark:border-[rgba(168,198,232,.12)]" {...p} />,
  code: ({ node: _n, ...p }) => <code className="rounded bg-brand-100 px-1 py-0.5 text-[.9em] dark:bg-[rgba(168,198,232,.12)]" {...p} />,
  pre: ({ node: _n, ...p }) => <pre className="m-0 overflow-x-auto rounded-xl bg-brand-100 p-3 text-[13px] dark:bg-[rgba(168,198,232,.08)] [&>code]:bg-transparent [&>code]:p-0" {...p} />,
  blockquote: ({ node: _n, ...p }) => <blockquote className="m-0 border-l-2 border-brand-300 pl-3 text-brand-700 dark:text-brand-300" {...p} />,
  hr: () => <hr className="border-0 border-t border-brand-200 dark:border-[rgba(168,198,232,.2)]" />
};

// "Sources: A; B" on the last line, kept out of the Markdown so it can be styled as a footer
export function splitSources(text: string): { body: string; sources: string | null } {
  const m = text.match(/\n[ \t]*\**Sources:\**[ \t]*(.+?)[ \t]*$/i) ?? text.match(/^[ \t]*\**Sources:\**[ \t]*(.+?)[ \t]*$/i);
  if (!m || m.index === undefined) return { body: text, sources: null };
  return { body: text.slice(0, m.index).trimEnd(), sources: m[1].replace(/\*+/g, "").trim() };
}

export function AnswerMarkdown({ text, streaming = false, className = "" }: { text: string; streaming?: boolean; className?: string }) {
  // while streaming, a half-written "Sources:" line stays in the body until the answer is complete
  const { body, sources } = streaming ? { body: text, sources: null } : splitSources(text);
  return (
    <div className={`text-[14.4px] leading-[1.65] [overflow-wrap:anywhere] text-brand-800 dark:text-brand-300 [&>*+*]:mt-3 [&>*+h3]:mt-5 [&>*+h4]:mt-4 [&>h3+*]:mt-1.5 [&>h4+*]:mt-1 ${className}`}>
      <Markdown remarkPlugins={[remarkGfm]} components={components} disallowedElements={["img"]} unwrapDisallowed skipHtml>
        {body}
      </Markdown>
      {streaming && <span aria-hidden="true" className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-blink bg-brand-500" />}
      {sources && (
        <p className="m-0 border-t border-brand-200 pt-2.5 text-[12.5px] leading-[1.5] text-brand-700 dark:border-[rgba(168,198,232,.18)] dark:text-brand-400">
          <span className="font-semibold">{"Sources: "}</span>{sources}
        </p>
      )}
    </div>
  );
}
