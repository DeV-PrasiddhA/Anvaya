import { useEffect, useState } from "react";

export function useToast(durationMs = 2400) {
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "info" | "warning" | "error">(
    "success"
  );

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), durationMs);
    return () => clearTimeout(t);
  }, [message, durationMs]);

  return {
    message,
    tone,
    show: (
      msg: string,
      next: "success" | "info" | "warning" | "error" = "success"
    ) => {
      setTone(next);
      setMessage(msg);
    },
    clear: () => setMessage(null),
  };
}
