"use client";

export type HammyMood = "idle" | "listening" | "thinking" | "happy" | "oops";

interface Props {
  mood?: HammyMood;
  size?: number;
  className?: string;
}

const ORANGE = "#F5A83C";
const ORANGE_DARK = "#E08F22";
const CREAM = "#FFF6E7";
const PINK = "#FFB3C2";
const OUTLINE = "#5C3A18";
const INK = "#2B1D0E";

export default function Hammy({ mood = "idle", size = 64, className }: Props) {
  return (
    <span className={`hammy-breathe inline-block ${className ?? ""}`}>
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={`Hammy — ${mood}`}
    >
      {/* ears */}
      <circle cx={27} cy={27} r={16} fill={ORANGE_DARK} stroke={OUTLINE} strokeWidth={3} />
      <circle cx={93} cy={27} r={16} fill={ORANGE_DARK} stroke={OUTLINE} strokeWidth={3} />
      <circle cx={27} cy={27} r={7.5} fill={PINK} />
      <circle cx={93} cy={27} r={7.5} fill={PINK} />

      {/* fur tuft */}
      <path
        d="M52 12 Q56 2 60 12 Q64 2 68 12"
        stroke={OUTLINE}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* head */}
      <ellipse cx={60} cy={62} rx={42} ry={38} fill={ORANGE} stroke={OUTLINE} strokeWidth={3.5} />

      {/* muzzle / cream patch */}
      <ellipse cx={60} cy={76} rx={27} ry={21} fill={CREAM} stroke={OUTLINE} strokeWidth={2.5} />

      {/* cheeks blush */}
      <ellipse cx={30} cy={71} rx={10} ry={7.5} fill={PINK} opacity={0.9} />
      <ellipse cx={90} cy={71} rx={10} ry={7.5} fill={PINK} opacity={0.9} />

      {/* eyes + eyebrows (mood-based) */}
      {mood === "happy" ? (
        <>
          <path d="M40 56 Q47 47 54 56" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d="M66 56 Q73 47 80 56" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        </>
      ) : mood === "oops" ? (
        <>
          <path d="M38 46 Q45 41 51 45" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M69 45 Q75 41 82 46" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <circle cx={46} cy={56} r={4} fill={INK} />
          <circle cx={74} cy={56} r={4} fill={INK} />
          <circle cx={44.5} cy={54.5} r={1.2} fill="#FFFFFF" />
          <circle cx={72.5} cy={54.5} r={1.2} fill="#FFFFFF" />
        </>
      ) : mood === "thinking" ? (
        <>
          <path d="M64 47 Q72 42 80 45" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <circle cx={46} cy={57} r={5} fill={INK} />
          <circle cx={44.5} cy={55.3} r={1.4} fill="#FFFFFF" />
          <circle cx={76} cy={54} r={5} fill={INK} />
          <circle cx={74.5} cy={52.3} r={1.4} fill="#FFFFFF" />
        </>
      ) : mood === "listening" ? (
        <>
          <circle cx={46} cy={56} r={6} fill={INK} />
          <circle cx={74} cy={56} r={6} fill={INK} />
          <circle cx={44} cy={53.7} r={1.6} fill="#FFFFFF" />
          <circle cx={72} cy={53.7} r={1.6} fill="#FFFFFF" />
        </>
      ) : (
        <>
          <circle cx={46} cy={57} r={5.5} fill={INK} />
          <circle cx={74} cy={57} r={5.5} fill={INK} />
          <circle cx={44.3} cy={54.8} r={1.5} fill="#FFFFFF" />
          <circle cx={72.3} cy={54.8} r={1.5} fill="#FFFFFF" />
        </>
      )}

      {/* nose */}
      <ellipse cx={60} cy={68} rx={4.5} ry={3.2} fill={OUTLINE} />

      {/* mouth (mood-based) */}
      {mood === "happy" ? (
        <path
          d="M46 78 Q60 92 74 78 Q60 86 46 78 Z"
          fill="#B5566B"
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      ) : mood === "oops" ? (
        <ellipse cx={60} cy={80} rx={4.5} ry={5.5} fill={INK} />
      ) : mood === "listening" ? (
        <ellipse cx={60} cy={80} rx={5.5} ry={6.5} fill={INK} />
      ) : (
        <path d="M50 78 Q60 84 70 78" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      )}
    </svg>
    </span>
  );
}
