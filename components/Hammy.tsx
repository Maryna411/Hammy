"use client";

export type HammyMood = "idle" | "listening" | "thinking" | "happy" | "oops";

interface Props {
  mood?: HammyMood;
  size?: number;
  className?: string;
}

export default function Hammy(props: Props) {
  const mood = props.mood || "idle";
  const size = props.size || 64;
  const extraClass = props.className || "";
  const wrapperClass = "hammy-breathe inline-block " + extraClass;

  return (
    <img
      src={"/" + mood + ".png"}
      alt={"Hammy mood: " + mood}
      className={wrapperClass}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
