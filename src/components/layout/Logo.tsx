import Image from "next/image";

/**
 * DeHatch logo. `mark` crops the round logo to its egg-and-rocket emblem so it stays
 * readable at small sizes; `full` shows the complete logo including the wordmark.
 */
export default function Logo({
  size = 40,
  variant = "mark",
}: {
  size?: number;
  variant?: "mark" | "full";
}) {
  const scale = variant === "mark" ? 1.9 : 1;
  const imgSize = size * scale;
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "#fff",
      }}
    >
      <Image
        src="/logo.jpg"
        alt=""
        width={Math.round(imgSize)}
        height={Math.round(imgSize)}
        priority
        style={{
          position: "absolute",
          maxWidth: "none",
          width: imgSize,
          height: imgSize,
          // centre the emblem (it sits at ~50% / 42% of the source image)
          left: variant === "mark" ? -(0.5 * imgSize - 0.5 * size) : 0,
          top: variant === "mark" ? -(0.42 * imgSize - 0.5 * size) : 0,
        }}
      />
    </span>
  );
}
