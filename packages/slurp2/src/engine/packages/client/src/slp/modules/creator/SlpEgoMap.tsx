import { Avatar, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { cn } from "../../../lib/utils";

export type SlpEgoNode = { id: string; name: string; avatarUrl: string | null };
export type SlpEgoSpoke = {
  node: SlpEgoNode;
  /** A theme color (`var(--…)`) for the line and the ring around the avatar. */
  color: string;
  /** How close (0-3): closer people sit nearer the center and get a thicker line. */
  closeness: number;
  /** Dashed for tense, dotted for cold, solid for warm. */
  dash?: "tense" | "cold";
  /** What they are to the center, for screen readers and the caption ("Best friend"). */
  label: string;
};

const DASH = { tense: "3 2", cold: "0.6 1.6" } as const;

/** Where spoke `index` of `count` sits, in percent of the square. Crowded maps alternate two rings. */
function place(index: number, count: number, closeness: number) {
  const angle = (index / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2;
  const stagger = count > 10 && index % 2 === 1 ? 7 : 0;
  const radius = Math.max(22, 38 - closeness * 3.5 - stagger);
  return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
}

/**
 * One person in the middle, their people around them (Drama, People map). Lines carry the tie: color
 * for the kind, width for how close, a dash for how it feels right now. Tapping someone moves them to
 * the middle. Plain SVG under positioned buttons, so every person is a real, focusable control.
 */
export function SlpEgoMap({
  center,
  spokes,
  onPick,
  label,
}: {
  center: SlpEgoNode;
  spokes: SlpEgoSpoke[];
  onPick: (id: string) => void;
  /** The map's name for screen readers ("Lena's people"). */
  label: string;
}) {
  const placed = spokes.map((spoke, index) => ({ spoke, ...place(index, spokes.length, spoke.closeness) }));
  return (
    <div
      role="group"
      aria-label={label}
      className="relative mx-auto w-full"
      style={{ maxWidth: "26rem", aspectRatio: "1 / 1" }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {placed.map(({ spoke, x, y }) => (
          <line
            key={spoke.node.id}
            x1={50}
            y1={50}
            x2={x}
            y2={y}
            stroke={spoke.color}
            strokeWidth={0.5 + spoke.closeness * 0.35}
            strokeDasharray={spoke.dash ? DASH[spoke.dash] : undefined}
            strokeLinecap="round"
            opacity={spoke.dash === "cold" ? 0.7 : 0.9}
          />
        ))}
      </svg>
      <Person node={center} x={50} y={50} center />
      {placed.map(({ spoke, x, y }) => (
        <Person
          key={spoke.node.id}
          node={spoke.node}
          x={x}
          y={y}
          color={spoke.color}
          caption={spoke.label}
          onPick={() => onPick(spoke.node.id)}
        />
      ))}
    </div>
  );
}

function Person({
  node,
  x,
  y,
  color,
  caption,
  center,
  onPick,
}: {
  node: SlpEgoNode;
  x: number;
  y: number;
  color?: string;
  caption?: string;
  center?: boolean;
  onPick?: () => void;
}) {
  const body = (
    <>
      <span className="rounded-full" style={{ boxShadow: `0 0 0 2px ${color ?? "var(--noodle-accent)"}` }}>
        <Avatar account={{ displayName: node.name, avatarUrl: node.avatarUrl }} size={center ? "md" : "sm"} />
      </span>
      <span
        className={cn(
          SLP_TYPE.meta,
          "block truncate text-center",
          center ? "font-semibold" : "text-[var(--slurp-muted)]",
        )}
        style={{ maxWidth: "5.5rem" }}
      >
        {node.name}
      </span>
    </>
  );
  const style = { left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -30%)" } as const;
  return center || !onPick ? (
    <span className="absolute flex flex-col items-center gap-1" style={style}>
      {body}
    </span>
  ) : (
    <button
      type="button"
      onClick={onPick}
      aria-label={caption ? `${node.name}: ${caption}` : node.name}
      className="absolute flex min-h-11 min-w-11 flex-col items-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slurp-focus)]"
      style={style}
    >
      {body}
    </button>
  );
}
