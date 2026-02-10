'use client';

import {pageHeadingClasses} from './PageHeading.styles';

export type PageHeadingProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
};

/**
 * Универсальный заголовок страницы (title + description).
 * Используется как стабильная "шапка контента" под полоской загрузки при навигации.
 */
export function PageHeading({title, subtitle}: PageHeadingProps) {
  return (
    <header className={pageHeadingClasses.root}>
      <h1 className={pageHeadingClasses.title}>{title}</h1>
      {subtitle ? (
        <p className={pageHeadingClasses.subtitle}>{subtitle}</p>
      ) : null}
    </header>
  );
}

