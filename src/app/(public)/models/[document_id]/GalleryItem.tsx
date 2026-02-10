'use client';

import Image from 'next/image';
import {useState} from 'react';

import {modelDetailPageClasses} from './page.styles';

type Orientation = 'horizontal' | 'vertical';

function detectOrientation(img: HTMLImageElement): Orientation {
  if (!img.naturalWidth || !img.naturalHeight) return 'horizontal';
  return img.naturalWidth >= img.naturalHeight ? 'horizontal' : 'vertical';
}

export function GalleryItem({
  src,
  alt,
  isSolo
}: {
  src: string;
  alt: string;
  isSolo: boolean;
}) {
  const [orientation, setOrientation] = useState<Orientation>('horizontal');

  const aspectClass =
    orientation === 'vertical'
      ? modelDetailPageClasses.galleryItemVertical
      : modelDetailPageClasses.galleryItemHorizontal;

  return (
    <div
      className={`${modelDetailPageClasses.galleryItem} ${aspectClass} ${
        isSolo ? modelDetailPageClasses.galleryItemSolo : ''
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={modelDetailPageClasses.galleryImage}
        sizes="(max-width: 640px) 100vw, 50vw"
        onLoadingComplete={(img) => {
          const next = detectOrientation(img);
          setOrientation((prev) => (prev === next ? prev : next));
        }}
      />
    </div>
  );
}

