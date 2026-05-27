import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { cn } from '../../assets/utils';

const normalizeMarkdown = (value = '') => {
  if (!value) return '';

  return String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/blockquote>/gi, '\n\n')
    .replace(/<li>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const MarkdownRenderer = ({ content, className, compact = false }) => (
  <div
    className={cn(
      'markdown-renderer prose max-w-none overflow-hidden rounded-2xl prose-slate dark:prose-invert prose-headings:font-semibold prose-p:my-3 prose-li:my-1 prose-pre:my-4 prose-code:before:content-none prose-code:after:content-none',
      compact ? 'prose-sm' : 'prose-base sm:prose-lg',
      className,
    )}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        p: ({ className: paragraphClassName, ...props }) => <p className={cn('text-slate-700 dark:text-slate-300', paragraphClassName)} {...props} />,
        a: ({ className: linkClassName, ...props }) => <a className={cn('font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary', linkClassName)} {...props} />,
        blockquote: ({ className: quoteClassName, ...props }) => <blockquote className={cn('border-l-4 border-primary/40 pl-4 italic text-slate-600 dark:text-slate-400', quoteClassName)} {...props} />,
        ul: ({ className: listClassName, ...props }) => <ul className={cn('list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300', listClassName)} {...props} />,
        ol: ({ className: listClassName, ...props }) => <ol className={cn('list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-300', listClassName)} {...props} />,
        li: ({ className: itemClassName, ...props }) => <li className={cn('marker:text-slate-400 dark:marker:text-slate-500', itemClassName)} {...props} />,
        h1: ({ className: headingClassName, ...props }) => <h1 className={cn('mb-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white', headingClassName)} {...props} />,
        h2: ({ className: headingClassName, ...props }) => <h2 className={cn('mb-3 mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white', headingClassName)} {...props} />,
        h3: ({ className: headingClassName, ...props }) => <h3 className={cn('mb-2 mt-5 text-xl font-semibold text-slate-950 dark:text-white', headingClassName)} {...props} />,
        h4: ({ className: headingClassName, ...props }) => <h4 className={cn('mb-2 mt-4 text-lg font-semibold text-slate-950 dark:text-white', headingClassName)} {...props} />,
        h5: ({ className: headingClassName, ...props }) => <h5 className={cn('mb-2 mt-4 text-base font-semibold text-slate-950 dark:text-white', headingClassName)} {...props} />,
        h6: ({ className: headingClassName, ...props }) => <h6 className={cn('mb-2 mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400', headingClassName)} {...props} />,
        table: ({ className: tableClassName, ...props }) => (
          <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
            <table className={cn('m-0 w-full border-collapse text-sm', tableClassName)} {...props} />
          </div>
        ),
        thead: ({ className: theadClassName, ...props }) => <thead className={cn('bg-slate-50 dark:bg-slate-900/80', theadClassName)} {...props} />,
        th: ({ className: thClassName, ...props }) => <th className={cn('border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100', thClassName)} {...props} />,
        td: ({ className: tdClassName, ...props }) => <td className={cn('border-b border-slate-200 px-4 py-3 align-top text-slate-700 dark:border-slate-800 dark:text-slate-300', tdClassName)} {...props} />,
        pre: ({ className: preClassName, children, ...props }) => (
          <pre className={cn('overflow-x-auto rounded-2xl border border-slate-800 bg-[#0b1220] p-0 text-sm text-slate-100 shadow-lg', preClassName)} {...props}>
            {children}
          </pre>
        ),
        code: ({ inline, className: codeClassName, children, ...props }) => {
          if (inline) {
            return <code className={cn('rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[0.92em] text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200', codeClassName)} {...props}>{children}</code>;
          }

          return <code className={cn('hljs block bg-transparent p-4 text-slate-100', codeClassName)} {...props}>{children}</code>;
        },
      }}
    >
      {normalizeMarkdown(content)}
    </ReactMarkdown>
  </div>
);

export default MarkdownRenderer;