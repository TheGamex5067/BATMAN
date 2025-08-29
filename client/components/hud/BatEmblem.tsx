export default function BatEmblem({ className = "w-40 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 256" className={className} aria-hidden>
      <path fill="currentColor" d="M256 32c23 25 48 35 70 38 41 6 72-14 90-34-6 25-24 52-41 65 22 6 42 19 56 44-22-5-47-10-69-2 15 15 26 33 28 61-20-18-48-30-79-30-30 0-49 8-55 13-6-5-25-13-55-13-31 0-59 12-79 30 2-28 13-46 28-61-22-8-47-3-69 2 14-25 34-38 56-44-17-13-35-40-41-65 18 20 49 40 90 34 22-3 47-13 70-38Z"/>
    </svg>
  );
}
