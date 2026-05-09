export function SvgSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <symbol id="star8" viewBox="0 0 24 24">
          <path
            d="M12 0 L13.5 9 L22.39 5.61 L15.92 12 L22.39 18.39 L13.5 15 L12 24 L10.5 15 L1.61 18.39 L8.08 12 L1.61 5.61 L10.5 9 Z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="triangle-flag" viewBox="0 0 12 12">
          <path d="M0 12 L6 0 L12 12 Z" fill="currentColor" />
        </symbol>
        <symbol id="square" viewBox="0 0 10 10">
          <rect width="10" height="10" fill="currentColor" />
        </symbol>
        <symbol id="diamond" viewBox="0 0 12 12">
          <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="currentColor" />
        </symbol>
        <symbol id="circle" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="5" fill="currentColor" />
        </symbol>
        <symbol id="arrow-right" viewBox="0 0 24 12">
          <path
            d="M0 6 H22 M16 0 L22 6 L16 12"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </symbol>
      </defs>
    </svg>
  );
}
