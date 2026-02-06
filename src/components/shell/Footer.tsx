import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t ui-line">
      <div className="grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-3">
        <div className="bg-[var(--color-paper)] p-6">
          <div className="font-condensed text-xs uppercase tracking-[0.18em]">
            ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ
          </div>
          <div className="mt-3 space-y-1 font-doc text-[11px] uppercase text-[var(--color-muted)]">
            <div>APOSTROPHE DIGITAL ASSETS LLC</div>
            <div>REG. NO: 2024-DA-01420</div>
            <div>JURISDICTION: INTERNATIONAL</div>
          </div>
        </div>

        <div className="bg-[var(--color-paper)] p-6">
          <div className="font-condensed text-xs uppercase tracking-[0.18em]">
            КОНТАКТЫ
          </div>
          <div className="mt-3 space-y-1 font-doc text-[11px] uppercase text-[var(--color-muted)]">
            <div>EMAIL: LICENSE@APOSTROPHE.DIGITAL</div>
            <div>PHONE: +1 (555) 000-1420</div>
            <div>SUPPORT: 24/7 AVAILABLE</div>
          </div>
        </div>

        <div className="bg-[var(--color-paper)] p-6">
          <div className="font-condensed text-xs uppercase tracking-[0.18em]">
            ДОКУМЕНТАЦИЯ
          </div>
          <div className="mt-3 space-y-1 font-doc text-[11px] uppercase text-[var(--color-muted)]">
            <Link className="block hover:text-[var(--color-ink)]" href="#">
              TERMS OF SERVICE
            </Link>
            <Link className="block hover:text-[var(--color-ink)]" href="#">
              PRIVACY POLICY
            </Link>
            <Link className="block hover:text-[var(--color-ink)]" href="#">
              LICENSING AGREEMENT
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 border-t ui-line bg-[var(--color-paper)] px-6 py-4 md:grid-cols-3 md:items-center">
        <div className="font-doc text-[11px] uppercase text-[var(--color-muted)]">
          © 2024 APOSTROPHE. ALL RIGHTS RESERVED.
        </div>
        <div className="text-left font-doc text-[11px] uppercase text-[var(--color-muted)] md:text-center">
          SYSTEM VERSION: 1.0.0 | BUILD: 20240815
        </div>
        <div className="text-left font-doc text-[11px] uppercase text-[var(--color-muted)] md:text-right">
          POWERED BY READDY
        </div>
      </div>
    </footer>
  );
}

