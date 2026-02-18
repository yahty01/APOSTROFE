'use client';

import {headerBaseClasses} from './HeaderBase.styles';

export function NavTabLabel({text}: {text: string}) {
  return (
    <span className={headerBaseClasses.navLabel}>
      {text}<span className={headerBaseClasses.apostrophe}>’</span>
    </span>
  );
}
