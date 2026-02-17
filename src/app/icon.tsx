import {ImageResponse} from 'next/og';

export const size = {
  width: 64,
  height: 64
};

export const contentType = 'image/png';

function FaviconMark() {
  return (
    <svg
      width="38"
      height="44"
      viewBox="0 0 287 339"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M46.9421 336.557L2.28027 56.1892L283.886 2.55664L196.635 336.557H46.9421Z"
        fill="black"
      />
      <path
        d="M46.9421 336.557L2.28027 56.1892L283.886 2.55664L196.635 336.557H46.9421Z"
        stroke="black"
        strokeWidth="4"
      />
    </svg>
  );
}

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
        <FaviconMark />
      </div>
    ),
    size
  );
}
