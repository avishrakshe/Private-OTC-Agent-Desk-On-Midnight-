import { useEffect, useRef, useState } from 'react';

export type Route = 'desk' | 'about';

const parseRoute = (): Route => {
  const path = window.location.hash.replace(/^#\/?/, '').split(/[?#/]/)[0];
  return path === 'about' ? 'about' : 'desk';
};

/** Minimal hash router (#/ and #/about) — works on static hosting without server rewrites. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(parseRoute);
  const current = useRef(route);

  useEffect(() => {
    const onChange = () => {
      const next = parseRoute();
      if (next !== current.current) {
        current.current = next;
        setRoute(next);
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  useEffect(() => {
    document.title =
      route === 'about' ? 'About · Private OTC Agent Desk' : 'Private OTC Agent Desk · Midnight';
  }, [route]);

  return route;
}
