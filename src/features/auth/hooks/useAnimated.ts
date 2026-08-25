import { useEffect, useState } from "react";

/** Marca `visible` en true poco después del montaje, para disparar una transición de entrada CSS. */
export function useAnimated() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return visible;
}
