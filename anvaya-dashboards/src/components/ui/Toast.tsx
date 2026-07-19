interface ToastProps {
  message: string;
  tone?: "success" | "info" | "warning" | "error";
  icon?: string;
}

const TONE: Record<NonNullable<ToastProps["tone"]>, string> = {
  success: "bg-secondary text-on-secondary",
  info: "bg-primary text-on-primary",
  warning: "bg-primary-container text-on-primary",
  error: "bg-error text-on-error",
};

export default function Toast({
  message,
  tone = "success",
  icon = "check_circle",
}: ToastProps) {
  return (
    <div
      className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[110] ${TONE[tone]} px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce-in`}
      role="status"
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className="font-label-caps text-label-caps">{message}</span>
    </div>
  );
}
