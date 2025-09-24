import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const getIsMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  };

  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile());

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(getIsMobile());
    try {
      mql.addEventListener("change", onChange);
    } catch {
      // Safari fallback
      // @ts-ignore
      mql.addListener(onChange);
    }
    setIsMobile(getIsMobile());
    return () => {
      try {
        mql.removeEventListener("change", onChange);
      } catch {
        // @ts-ignore
        mql.removeListener(onChange);
      }
    };
  }, []);

  return !!isMobile;
}
