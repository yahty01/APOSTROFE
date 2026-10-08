// Match the real grid, its padding and the 1540px profile width limit.
export const PROFILE_IMAGE_SIZES = '(max-width: 767px) calc(100vw - 34px), (max-width: 1023px) calc(100vw - 50px), (max-width: 1589px) calc(40vw - 20px), 616px';

export function galleryImageSizes(isSolo: boolean) {
  return isSolo
    ? '(max-width: 767px) calc(100vw - 68px), (max-width: 1299px) calc(100vw - 100px), 1200px'
    : '(max-width: 639px) calc(100vw - 68px), (max-width: 767px) calc(50vw - 42px), (max-width: 1589px) calc(50vw - 58px), 737px';
}
