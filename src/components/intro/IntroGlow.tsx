export function IntroGlow({ className }: { className: string }) {
  return (
    <div
      className={`pointer-events-none absolute size-[980px] ${className}`}
      aria-hidden
    >
      <div className="absolute inset-[-24.51%]">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative background blob, not worth next/image's overhead */}
        <img
          alt=""
          className="block size-full max-w-none"
          src="/intro/ambient-glow.svg"
        />
      </div>
    </div>
  );
}
