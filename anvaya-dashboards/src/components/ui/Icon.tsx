import { useState } from "react";

interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
}

const SIZE_STYLES: Record<number, string> = {
  14: "text-[14px]",
  16: "text-[16px]",
  18: "text-[18px]",
  20: "text-[20px]",
  24: "text-[24px]",
  28: "text-[28px]",
  32: "text-[32px]",
};

export default function Icon({
  name,
  filled = false,
  className = "",
  size = 24,
}: IconProps) {
  const sizeClass = SIZE_STYLES[size] ?? `text-[${size}px]`;
  return (
    <span
      className={`material-symbols-outlined ${sizeClass} leading-none ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
