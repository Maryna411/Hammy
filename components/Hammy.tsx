"use client";

export type HammyMood = "idle" | "listening" | "thinking" | "happy" | "oops";

interface Props {
  mood?: HammyMood;
  size?: number;
  className?: string;
}

const POSITION: Record<HammyMood, string> = {
  idle: "0% 0%",
  listening: "50% 0%",
  thinking: "100% 0%",
  happy: "0% 100%",
  oops: "50% 100%",
};

export default function Hammy({ mood = "idle", size = 64, className }: Props) {
  return (
    <span
      role="img"
      aria-label={`Hammy — ${mood}`}
      className={`hammy-breathe inline-block overflow-hidden rounded-full ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url('/Hammy.png')",
        backgroundSize: "300% 200%",
        backgroundPosition: POSITION[mood],
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
