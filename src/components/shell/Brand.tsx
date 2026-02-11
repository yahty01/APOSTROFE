"use client";

import Link from "next/link";

import { brandClasses } from "./Brand.styles";

const BRAND_MARK_TRANSFORM =
  "translate(20.3774253982 15) scale(0.2095806438) translate(-2.28174 -2.55469)";
const BRAND_MARK_PATH =
  "M47.1146 336.555L2.28174 56.1873L284.966 2.55469L197.381 336.555H47.1146Z";

/**
 * Бренд-блок шапки (знак + текст).
 *
 * Почему SVG инлайн:
 * - не плодим отдельные запросы к ассетам;
 * - можно красить через `currentColor` (единый источник цвета).
 *
 * Transform подобран так, чтобы знак всегда сидел в квадратном боксе с "safe padding" ≥ 15%,
 * совпадая по геометрии с `src/app/icon.svg`.
 */
export function Brand({
  href,
  label = "APOSTROPHE",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link href={href} className={brandClasses.root}>
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 100 100"
        className={brandClasses.mark}
      >
        <g transform={BRAND_MARK_TRANSFORM}>
          <path
            d={BRAND_MARK_PATH}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={4}
          />
        </g>
      </svg>
      <span className={brandClasses.label}>{label}</span>
    </Link>
  );
}

