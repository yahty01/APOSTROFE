'use client';

import {headerBaseClasses} from './HeaderBase.styles';

export function NavTabLabel({text}: {text: string}) {
  return (
    <>
      {text}
      <span className={headerBaseClasses.apostrophe}>’</span>
    </>
  );
}

