// "Showing 26–50 of 230" with page links. Plain links, so filters stay in the address and pages can be shared.
export default function Pagination({ page, total, size, href }: { page: number; total: number; size: number; href: (n: number) => string }) {
  if (!total) return null;
  const last = Math.max(1, Math.ceil(total / size));
  const numbers = [...new Set([1, page - 1, page, page + 1, last])].filter(n => n >= 1 && n <= last).sort((a, b) => a - b);
  const link = "grid min-h-9 min-w-9 place-items-center rounded-lg px-2.5 text-sm font-semibold no-underline";
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Pages">
      <p className="text-sm text-brand-800">{`Showing ${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total}`}</p>
      {last > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          {page > 1 && <a className={`${link} text-ink hover:bg-brand-100`} href={href(page - 1)} rel="prev">{"← Previous"}</a>}
          {numbers.map((n, i) => (
            <span key={n} className="contents">
              {i > 0 && n - numbers[i - 1] > 1 && <span className="px-1 text-brand-600" aria-hidden="true">{"…"}</span>}
              {n === page
                ? <span className={`${link} bg-ink text-white`} aria-current="page">{n}</span>
                : <a className={`${link} text-ink hover:bg-brand-100`} href={href(n)}>{n}</a>}
            </span>
          ))}
          {page < last && <a className={`${link} text-ink hover:bg-brand-100`} href={href(page + 1)} rel="next">{"Next →"}</a>}
        </div>
      )}
    </nav>
  );
}
