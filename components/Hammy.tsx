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

export default function Hammy(props: Props) {
  const mood = props.mood || "idle";
  const size = props.size || 64;
  const extraClass = props.className || "";
  const label = "Hammy mood: " + mood;
  const wrapperClass = "hammy-breathe inline-block overflow-hidden rounded-full " + extraClass;

  const style = {
    width: size,
    height: size,
    backgroundImage: "url(/Hammy.png)",
    backgroundSize: "300% 200%",
    backgroundPosition: POSITION[mood],
    backgroundRepeat: "no-repeat",
  };

  return <span role="img" aria-label={label} className={wrapperClass} style={style}></span>;
}
