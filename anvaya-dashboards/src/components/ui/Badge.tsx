interface BadgeProps {
  tone?: "default" | "success" | "warning" | "info" | "error";
  icon?: string;
  className?: string;
  children: React.ReactNode;
}

const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-surface-container-high text-on-surface border-outline-variant/30",
  success:
    "bg-secondary/10 text-secondary border-secondary/20",
  warning:
    "bg-primary-container/15 text-primary-container border-primary-container/30",
  info: "bg-surface-container-high text-on-surface-variant border-outline-variant/30",
  error: "bg-error-container/40 text-error border-error/30",
};

export default function Badge({
  tone = "default",
  icon,
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold border transition-all duration-200 ${TONE_CLASSES[tone]} ${className}`}
    >
      {icon && (
        <span
          className="material-symbols-outlined text-[14px] leading-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
