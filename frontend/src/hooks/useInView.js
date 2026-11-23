import { useEffect, useState } from 'react';

/** true en cuanto el elemento entra (o está por entrar) en pantalla; no vuelve a false. */
export function useInView(ref, rootMargin = '200px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return undefined;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, inView]);
  return inView;
}
