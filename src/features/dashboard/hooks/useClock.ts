import { useEffect, useState } from "react";

/** Fecha/hora actual, refrescada cada minuto. */
export function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}
