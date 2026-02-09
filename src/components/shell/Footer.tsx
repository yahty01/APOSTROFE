import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {footerClasses} from './Footer.styles';

/**
 * Общий футер проекта (публичная часть и админка).
 * Содержит юридическую информацию, контакты и ссылочные заглушки для документов.
 */
export async function Footer() {
  const t = await getTranslations('footer');

  const version = '1.0.0';
  const build = '20240815';

  return (
    <footer className={footerClasses.footer}>
      <div className={footerClasses.topGrid}>
        <div className={footerClasses.topPanel}>
          <div className={footerClasses.topTitle}>
            {t('legalTitle')}
          </div>
          <div className={footerClasses.topList}>
            <div>{t('legalCompany')}</div>
            <div>{t('legalRegNo')}</div>
            <div>{t('legalJurisdiction')}</div>
          </div>
        </div>

        <div className={footerClasses.topPanel}>
          <div className={footerClasses.topTitle}>
            {t('contactsTitle')}
          </div>
          <div className={footerClasses.topList}>
            <div>{t('contactsEmail')}</div>
            <div>{t('contactsPhone')}</div>
            <div>{t('contactsSupport')}</div>
          </div>
        </div>

        <div className={footerClasses.topPanel}>
          <div className={footerClasses.topTitle}>
            {t('docsTitle')}
          </div>
          <div className={footerClasses.topList}>
            <Link className={footerClasses.topLink} href="#">
              {t('docsTerms')}
            </Link>
            <Link className={footerClasses.topLink} href="#">
              {t('docsPrivacy')}
            </Link>
            <Link className={footerClasses.topLink} href="#">
              {t('docsLicensing')}
            </Link>
          </div>
        </div>
      </div>

      <div className={footerClasses.bottomGrid}>
        <div className={footerClasses.bottomText}>
          {t('rights')}
        </div>
        <div className={footerClasses.bottomTextCenter}>
          {t('systemVersion', {version, build})}
        </div>
        <div className={footerClasses.bottomTextRight}>
          {t('poweredBy')}{' '}
          <Link
            className={footerClasses.bottomLink}
            href="https://t.me/Sonolbol"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('createdBy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
