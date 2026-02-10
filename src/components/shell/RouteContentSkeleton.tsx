'use client';

import {routeContentSkeletonClasses} from './RouteContentSkeleton.styles';

type SkeletonBoxProps = {
  className: string;
};

function SkeletonBox({className}: SkeletonBoxProps) {
  return (
    <div
      aria-hidden
      className={`${routeContentSkeletonClasses.boxBase} ${className}`}
    />
  );
}

export function RouteContentSkeleton() {
  return (
    <div aria-hidden className={routeContentSkeletonClasses.root}>
      <div className={routeContentSkeletonClasses.toolbarGrid}>
        <div className={routeContentSkeletonClasses.panel}>
          <div className={routeContentSkeletonClasses.blocks}>
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-3 w-40" />
          </div>
        </div>
        <div className={routeContentSkeletonClasses.panel}>
          <div className={routeContentSkeletonClasses.blocks}>
            <SkeletonBox className="h-3 w-20" />
            <SkeletonBox className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className={routeContentSkeletonClasses.grid}>
        {Array.from({length: 6}).map((_, idx) => (
          <div key={idx} className={routeContentSkeletonClasses.card}>
            <SkeletonBox className={routeContentSkeletonClasses.media} />
            <div className={routeContentSkeletonClasses.meta}>
              <SkeletonBox className="h-3 w-28" />
              <SkeletonBox className="h-3 w-44" />
              <SkeletonBox className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className={routeContentSkeletonClasses.paginationWrap}>
        <SkeletonBox className="h-3 w-44" />
        <div className={routeContentSkeletonClasses.paginationButtons}>
          <SkeletonBox className="h-10 w-28" />
          <SkeletonBox className="h-10 w-28" />
          <SkeletonBox className="hidden h-10 w-20 md:block" />
        </div>
      </div>
    </div>
  );
}

