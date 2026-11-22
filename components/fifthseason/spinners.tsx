'use client';

import { useId } from 'react';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/**
 * Fifthseason.ai loader set v1.
 *
 * Five loading indicators built on the archetypes catalogued at
 * magecdn.com/tools/svg-loaders (puff, bars, three-dots, rings, oval),
 * rebuilt around the one idea the stock set cannot carry: everything
 * counts to five. Five petals, five bars, five orbiting points, five
 * ticks on the ring, five leaves in the mark.
 *
 * Pure SVG and CSS — no animation library, no runtime cost. Keyframes
 * live in `app/globals.css` under "Fifthseason spinner system"; colour
 * comes from `currentColor`, so a spinner inside a button is already
 * the right colour.
 */

export type FifthseasonSpinnerProps = {
  /** Rendered size in px. Also settable in CSS via `--fs-size`. */
  size?: number;
  /** Speed multiplier; 1 is the designed tempo. Also `--fs-speed`. */
  speed?: number;
  /** `solid` inherits currentColor; `seasonal` colours the five parts. */
  tone?: 'solid' | 'seasonal';
  /** Accessible name. Pass `null` when visible text already says it. */
  label?: string | null;
  className?: string;
};

function spinnerProps(
  {
    size,
    speed,
    tone = 'solid',
    label = 'Loading',
    className,
  }: FifthseasonSpinnerProps,
  variant: string,
) {
  const style = {
    ...(size !== undefined && { '--fs-size': `${size}px` }),
    ...(speed !== undefined && { '--fs-speed': `${speed}` }),
  } as CSSProperties;

  return {
    viewBox: '0 0 48 48',
    style,
    className: cn(
      'fs-spin',
      variant,
      tone === 'seasonal' && 'is-seasonal',
      className,
    ),
    ...(label === null
      ? { 'aria-hidden': true }
      : { role: 'status', 'aria-label': label }),
  } as const;
}

/** The five seasons, in order. Used to tint each part in `seasonal`. */
const SEASONS = ['fs-s1', 'fs-s2', 'fs-s3', 'fs-s4', 'fs-s5'] as const;

/** Evenly spaced fifths of a turn. */
const FIFTHS = [0, 72, 144, 216, 288] as const;

/* ------------------------------------------------------------------ *
 * 01 — Bloom (Spring)
 * Five petals open outward in sequence while the head turns slowly
 * against the beat. Descends from `puff` and the cog spinners.
 * Use for route transitions and empty states. Renders down to 20px.
 * ------------------------------------------------------------------ */

const BLOOM_DELAYS = ['0s', '-0.32s', '-0.64s', '-0.96s', '-1.28s'];

export function Bloom(props: FifthseasonSpinnerProps) {
  return (
    <svg {...spinnerProps(props, 'fs-bloom')}>
      <g className="fs-rotor">
        {FIFTHS.map((angle, i) => (
          <g key={angle} transform={`rotate(${angle} 24 24)`}>
            <rect
              className={cn('fs-pulse fs-bloom__petal', SEASONS[i])}
              x="21.5"
              y="5"
              width="5"
              height="14"
              rx="2.5"
              fill="currentColor"
              style={{ animationDelay: BLOOM_DELAYS[i] }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 02 — Cycle Bars (Summer)
 * The equalizer figure cut to five columns. A short stagger sends a
 * wave left to right, so it reads as throughput rather than waiting.
 * Descends from `bars` and `audio`. The only inline-safe one at 16px.
 * ------------------------------------------------------------------ */

const BAR_X = [3, 11.5, 21, 30.5, 39];
const BAR_DELAYS = ['0s', '-0.12s', '-0.24s', '-0.36s', '-0.48s'];

export function CycleBars(props: FifthseasonSpinnerProps) {
  return (
    <svg {...spinnerProps(props, 'fs-bars')}>
      {BAR_X.map((x, i) => (
        <rect
          key={x}
          className={cn('fs-pulse fs-bars__bar', SEASONS[i])}
          x={x}
          y="10"
          width="6"
          height="28"
          rx="3"
          fill="currentColor"
          style={{ animationDelay: BAR_DELAYS[i] }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 03 — Fifth Orbit (Autumn)
 * Five points on a ring, each swelling a fifth of a cycle behind the
 * last. The pulse travels one way and the ring turns the other, which
 * produces a comet-tail read without drawing a tail. Descends from
 * `three-dots` and `spinning-circles`. Renders down to 24px.
 * ------------------------------------------------------------------ */

const ORBIT_DOTS = [
  { cx: 24, cy: 8, delay: '0s' },
  { cx: 39.22, cy: 19.06, delay: '-0.3s' },
  { cx: 33.4, cy: 36.94, delay: '-0.6s' },
  { cx: 14.6, cy: 36.94, delay: '-0.9s' },
  { cx: 8.78, cy: 19.06, delay: '-1.2s' },
];

export function FifthOrbit(props: FifthseasonSpinnerProps) {
  return (
    <svg {...spinnerProps(props, 'fs-orbit')}>
      <g className="fs-rotor">
        {ORBIT_DOTS.map((dot, i) => (
          <circle
            key={SEASONS[i]}
            className={cn('fs-pulse fs-orbit__dot', SEASONS[i])}
            cx={dot.cx}
            cy={dot.cy}
            r="4"
            fill="currentColor"
            style={{ animationDelay: dot.delay }}
          />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 04 — Season Ring (Winter)
 * One arc grows and contracts as it sweeps, against five fixed ticks
 * marking the quarters of the year and the fifth beyond them. The most
 * restrained figure in the set and the one to reach for by default.
 * Descends from `rings` and `tail-spin`.
 * ------------------------------------------------------------------ */

const TICK_DELAYS = ['0s', '-0.48s', '-0.96s', '-1.44s', '-1.92s'];

export function SeasonRing({
  ticks = true,
  ...props
}: FifthseasonSpinnerProps & {
  /** Drop the five ticks below ~28px, where they stop resolving. */
  ticks?: boolean;
}) {
  return (
    <svg {...spinnerProps(props, 'fs-ring')}>
      <circle
        cx="24"
        cy="24"
        r="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        opacity=".13"
      />
      {ticks && (
        <g>
          {FIFTHS.map((angle, i) => (
            <line
              key={angle}
              className={cn('fs-ring__tick', SEASONS[i])}
              x1="24"
              y1="1.6"
              x2="24"
              y2="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${angle} 24 24)`}
              style={{ animationDelay: TICK_DELAYS[i] }}
            />
          ))}
        </g>
      )}
      <g className="fs-rotor">
        <circle
          className="fs-ring__arc"
          cx="24"
          cy="24"
          r="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * The brand mark.
 *
 * PLACEHOLDER. This is the only invented artwork in the set — a
 * five-leaf rosette standing in for the real Fifthseason.ai logo,
 * which could not be fetched (no outbound network access from the
 * environment this was built in). Replace the paths below with the
 * real mark, normalised to a 48x48 box centred on (24, 24), and the
 * whole set is correct. Nothing else depends on it.
 * ------------------------------------------------------------------ */

const LEAF = 'M24 9 Q28.8 17 24 24 Q19.2 17 24 9 Z';

export function FifthseasonMark({ className }: { className?: string }) {
  return (
    <g className={className}>
      {FIFTHS.map((angle, i) => (
        <path
          key={angle}
          className={SEASONS[i]}
          d={LEAF}
          fill="currentColor"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * 05 — Mark Pulse (The Fifth Season)
 * The flagship. The mark holds the centre and breathes while a
 * gradient tail orbits it and a halo expands outward and dissolves.
 * The logo is never rotated — it stays upright and legible, which is
 * what separates a brand loader from a logo someone spun. Descends
 * from `oval` and `tail-spin`. Needs 40px and up.
 * ------------------------------------------------------------------ */

export function MarkPulse(props: FifthseasonSpinnerProps) {
  const tailId = useId();

  return (
    <svg {...spinnerProps(props, 'fs-mark')}>
      <defs>
        <linearGradient id={tailId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Sits inside the tail so it reads as emerging, then expands past it. */}
      <circle
        className="fs-pulse fs-mark__halo"
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <g className="fs-mark__tail">
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke={`url(#${tailId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="92 132"
          transform="rotate(-90 24 24)"
        />
      </g>

      <FifthseasonMark className="fs-pulse fs-mark__glyph" />
    </svg>
  );
}
