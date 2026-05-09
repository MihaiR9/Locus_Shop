import type { BottleColor, Gama } from "@/lib/wines";

const FILL: Record<BottleColor, string> = {
  white: "#DCD0BC",
  red: "#2a1416",
  rose: "#d8a8a0",
};
const STROKE: Record<BottleColor, string> = {
  white: "#8a7a5c",
  red: "#110608",
  rose: "#7a4a44",
};

type Props = {
  color: BottleColor;
  gama: Gama;
  code: string;
};

export function BottleSvg({ color, gama, code }: Props) {
  const fill = FILL[color];
  const stroke = STROKE[color];
  const labelFill = gama === "semne" ? "#CBBEAE" : "#EBE1DA";
  const labelStroke = "#A89D8D";

  return (
    <svg viewBox="0 0 80 200" aria-hidden="true">
      <path
        d="M32 0 H48 V40 Q60 50 60 70 V190 Q60 200 50 200 H30 Q20 200 20 190 V70 Q20 50 32 40 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.8"
      />
      <rect
        x={gama === "semne" ? "22" : "20"}
        y={gama === "semne" ? "98" : "100"}
        width={gama === "semne" ? "36" : "40"}
        height={gama === "semne" ? "64" : "60"}
        fill={labelFill}
        stroke={labelStroke}
        strokeWidth="0.4"
      />
      {gama === "semne" && (
        <g stroke="#1A1A1A" strokeWidth="0.3" fill="none" opacity="0.7">
          <path d="M25 112 Q40 108 55 114" />
          <path d="M25 120 Q40 116 55 122" />
        </g>
      )}
      <text
        x="40"
        y={gama === "semne" ? "140" : "130"}
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize={gama === "semne" ? "5" : "6"}
        fill="#1A1A1A"
        letterSpacing={gama === "semne" ? "0.4" : "0.5"}
      >
        {code}
      </text>
      <text
        x="40"
        y={gama === "semne" ? "152" : "142"}
        textAnchor="middle"
        fontFamily="Italiana, serif"
        fontSize="6"
        fill="#1A1A1A"
      >
        lócus
      </text>
    </svg>
  );
}
