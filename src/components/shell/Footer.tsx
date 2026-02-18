import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {footerClasses} from './Footer.styles';

/**
 * Общий футер проекта (публичная часть и админка).
 * Содержит юридическую информацию, контакты и ссылочные заглушки для документов.
 */
export async function Footer() {
  const t = await getTranslations('footer');
  const contactsSupport = t('contactsSupport');

  const version = '1.0.0';
  const build = '20260218';

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
            {contactsSupport ? <div>{contactsSupport}</div> : null}
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
            <Link className={footerClasses.topLink} href="/policy">
              {t('docsPrivacy')}
            </Link>
            <Link className={footerClasses.topLink} href="#">
              {t('docsLicensing')}
            </Link>
          </div>
        </div>

        <div className={footerClasses.metaPanel}>
          <div className={footerClasses.metaStack}>
            <div className={footerClasses.bottomText}>
              {t('rights')}
            </div>
            <div className={footerClasses.bottomTextCenter}>
              {t('systemVersion', {version, build})}
            </div>
            <div className={footerClasses.bottomTextRight}>
              <Link
                className={footerClasses.bottomLink}
                href="https://popel.pro"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('poweredBy')}
              </Link>{' '}
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
        </div>
      </div>
    </footer>
  );
}
