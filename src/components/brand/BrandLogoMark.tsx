/**
 * Brand mark used across the app (header + app icon).
 * Source: `/Users/sonolbol/Downloads/brend-logo.svg`
 *
 * Important: keep the SVG/filter blocks identical so the mark stays consistent everywhere.
 */
export function BrandLogoMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 287 339"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_n_396_449)">
        <path
          d="M46.9421 336.557L2.28027 56.1892L283.886 2.55664L196.635 336.557H46.9421Z"
          fill="black"
        />
        <path
          d="M46.9421 336.557L2.28027 56.1892L283.886 2.55664L196.635 336.557H46.9421Z"
          stroke="black"
          strokeWidth="4"
        />
      </g>
      <defs>
        <filter
          id="filter0_n_396_449"
          x="0"
          y="0"
          width="286.621"
          height="338.557"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="2 2"
            stitchTiles="stitch"
            numOctaves="3"
            result="noise"
            seed="3522"
          />
          <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
          <feComponentTransfer in="alphaNoise" result="coloredNoise1">
            <feFuncA
              type="discrete"
              tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "
            />
          </feComponentTransfer>
          <feComposite
            operator="in"
            in2="shape"
            in="coloredNoise1"
            result="noise1Clipped"
          />
          <feComponentTransfer in="alphaNoise" result="coloredNoise2">
            <feFuncA
              type="discrete"
              tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 "
            />
          </feComponentTransfer>
          <feComposite
            operator="in"
            in2="shape"
            in="coloredNoise2"
            result="noise2Clipped"
          />
          <feFlood floodColor="rgba(0, 0, 0, 0.5)" result="color1Flood" />
          <feComposite
            operator="in"
            in2="noise1Clipped"
            in="color1Flood"
            result="color1"
          />
          <feFlood floodColor="rgba(78, 78, 78, 0.25)" result="color2Flood" />
          <feComposite
            operator="in"
            in2="noise2Clipped"
            in="color2Flood"
            result="color2"
          />
          <feMerge result="effect1_noise_396_449">
            <feMergeNode in="shape" />
            <feMergeNode in="color1" />
            <feMergeNode in="color2" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
