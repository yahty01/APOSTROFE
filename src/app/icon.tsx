import {ImageResponse} from 'next/og';

import {BrandLogoMark} from '@/components/brand/BrandLogoMark';

export const size = {
  width: 64,
  height: 64
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderRadius: 14
        }}
      >
        <BrandLogoMark width={44} height={44} />
      </div>
    ),
    size
  );
}

