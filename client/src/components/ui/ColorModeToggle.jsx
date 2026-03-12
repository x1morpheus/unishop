import { useColorMode } from "@/hooks/useColorMode";
import { cn } from "@/utils/cn";

const MODES = [
  {
    id: "light",
    label: "Light",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "dark",
    label: "Dark",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    ),
  },
  {
    id: "dim",
    label: "Dim",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
        <path d="M10 6a4 4 0 00-4 4h8a4 4 0 00-4-4z" />
      </svg>
    ),
  },
  {
    id: "system",
    label: "Auto",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
      </svg>
    ),
  },
];

/**
 * Segmented color-mode toggle.
 * variant="icon"   — shows only the active icon (for Navbar)
 * variant="full"   — shows all 4 options as a segmented control
 */
export function ColorModeToggle({ variant = "full", className }) {
  const { mode, setMode } = useColorMode();

  if (variant === "icon") {
    const current = MODES.find((m) => m.id === mode) || MODES[0];
    const nextIdx  = (MODES.indexOf(current) + 1) % MODES.length;
    const next     = MODES[nextIdx];
    return (
      <button
        onClick={() => setMode(next.id)}
        title={`Switch to ${next.label} mode`}
        aria-label={`Switch to ${next.label} mode`}
        className={cn(
          "p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors",
          className
        )}
      >
        {current.icon}
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color mode"
      className={cn(
        "inline-flex items-center gap-0.5 p-1 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]",
        className
      )}
    >
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            role="radio"
            aria-checked={active}
            onClick={() => setMode(m.id)}
            title={`${m.label} mode`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
              active
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]/50"
            )}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
