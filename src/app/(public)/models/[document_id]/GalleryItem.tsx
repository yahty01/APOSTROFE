'use client';

import Image from 'next/image';

import {modelDetailPageClasses} from './page.styles';

export function GalleryItem({
  src,
  alt,
  isSolo
}: {
  src: string;
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
        alt={alt}
        fill
        className={modelDetailPageClasses.galleryImage}
        sizes="(max-width: 640px) 100vw, 50vw"
      />
    </div>
  );
}
