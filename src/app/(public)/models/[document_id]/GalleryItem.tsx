'use client';

import Image from 'next/image';
import {galleryImageSizes} from '@/components/models/image-sizes';

import {modelDetailPageClasses} from './page.styles';

export function GalleryItem({
  src,
  blurDataURL,
  alt,
  isSolo
}: {
  src: string;
  blurDataURL?: string;
  alt: string;
  isSolo: boolean;
}) {
  return (
    <div
      className={`${modelDetailPageClasses.galleryItem} ${
        isSolo ? modelDetailPageClasses.galleryItemSolo : ''
      }`}
    >
      <Image
        src={src}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        alt={alt}
        fill
        className={modelDetailPageClasses.galleryImage}
        style={{objectFit: 'contain', objectPosition: 'center'}}
        sizes={galleryImageSizes(isSolo)}
      />
    </div>
  );
}
