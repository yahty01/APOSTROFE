import type {SocialLink} from '@/lib/assets/model-properties';

export function SocialLinks({links, label}: {links: SocialLink[]; label: string}) {
  if (!links.length) return null;
  return (
    <nav aria-label={label} className="grid grid-cols-2 gap-px border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-3 max-sm:[&>a:last-child:nth-child(odd)]:col-span-2 sm:[&>a:last-child:nth-child(3n+1)]:col-span-3 sm:[&>a:last-child:nth-child(3n+2)]:col-span-2">
      {links.map((link) => (
        <a
          key={`${link.key}-${link.url}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-12 min-w-0 items-center gap-3 bg-[var(--color-surface)] px-3 py-3 text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-white focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
          aria-label={link.label}
          title={link.label}
        >
          <span aria-hidden="true" className="h-5 w-5 shrink-0 bg-current" style={{mask: `url(/social/${link.key}.svg) center / contain no-repeat`}} />
          <span className="min-w-0 font-doc text-[10px] uppercase tracking-[0.06em] [overflow-wrap:anywhere]">{link.label}</span>
          <span aria-hidden="true" className="ml-auto text-sm">↗</span>
        </a>
      ))}
    </nav>
  );
}
