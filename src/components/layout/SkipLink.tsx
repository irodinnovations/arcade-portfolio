'use client';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-black focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
