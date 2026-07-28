'use client';

import { useId } from 'react';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/**
 * Fifthseason.ai liquid loader set v2.
 *
 * Built to Apple's material vocabulary — real translucency, refraction,
 * specular light and physical easing. Two of the five are properly fluid:
 * Mercury merges like liquid metal, Tide fills the mark like water.
 *
 * Halo and Lens are DOM elements because they need `backdrop-filter` to
 * refract real page content; Mercury, Tide and Facet are SVG because they
 * need filters and clip paths. The API is the same for all five.
 *
 * Keyframes live in `app/globals.css` under "Fifthseason liquid loaders".
 */

/* ------------------------------------------------------------------ *
 * THE MARK
 *
 * PLACEHOLDER — a rounded pentagon standing in for the real
 * Fifthseason.ai logo, which could not be fetched (the build environment
 * has no outbound network access). Tide clips its liquid to this shape
 * and Facet sweeps light across it, so replacing this one string with the
 * real outline — normalised to a 48x48 box — is the whole swap. A single
 * closed path works best.
 * ------------------------------------------------------------------ */

export const MARK_PATH =
  'M28.85 10.53 L35.32 15.22 Q40.17 18.75 38.31 24.46 L35.85 32.04 ' +
  'Q33.99 37.75 27.99 37.75 L20.01 37.75 Q14.01 37.75 12.15 32.04 ' +
  'L9.69 24.46 Q7.83 18.75 12.68 15.22 L19.15 10.53 Q24 7 28.85 10.53 Z';

export type LiquidSpinnerProps = {
  /** Rendered size in px. Also settable in CSS via `--fsx-size`. */
  size?: number;
  /** Speed multiplier; 1 is the designed tempo. Also `--fsx-speed`. */
  speed?: number;
  /** Overrides the accent for this instance. Also `--accent`. */
  accent?: string;
  /** Accessible name. Pass `null` when visible text already says it. */
  label?: string | null;
  className?: string;
};

/**
 * `useId` returns ids containing characters that are not safe inside an SVG
 * `url(#…)` fragment reference — colons on React 18, guillemets on 19. Strip
 * everything that is not id-safe so the filters and clip paths resolve.
 */
function useSvgId() {
  return `fs${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

function shell(
  { size, speed, accent, label = 'Loading', className }: LiquidSpinnerProps,
  variant: string,
) {
  const style = {
    ...(size !== undefined && { '--fsx-size': `${size}px` }),
    ...(speed !== undefined && { '--fsx-speed': `${speed}` }),
    ...(accent !== undefined && { '--accent': accent }),
  } as CSSProperties;

  return {
    style,
    className: cn(variant, className),
    ...(label === null
      ? { 'aria-hidden': true }
      : { role: 'status', 'aria-label': label }),
  } as const;
}

/* ------------------------------------------------------------------ *
 * 01 — Halo
 * A ring of real glass, lit by a specular head that sweeps the rim. The
 * turn eases rather than runs flat, so it reads as weight moving.
 * The default. Works from 20px up.
 * ------------------------------------------------------------------ */

export function Halo(props: LiquidSpinnerProps) {
  return (
    <div {...shell(props, 'fsx fsx-halo')}>
      <div className="fsx-halo__glass" />
      <div className="fsx-halo__sweep" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 02 — Mercury
 * Five droplets pull away from a core and fall back into it. A blur
 * pushed through a hard alpha curve gives them surface tension, so they
 * neck and snap the way liquid metal does — the merging is the filter,
 * nothing is drawn. Needs 32px to read.
 * ------------------------------------------------------------------ */

const DROP_DELAYS = ['0s', '-0.42s', '-0.84s', '-1.26s', '-1.68s'];
const FIFTHS = [0, 72, 144, 216, 288];

export function Mercury(props: LiquidSpinnerProps) {
  const gooId = useSvgId();

  return (
    <svg {...shell(props, 'fsx-svg fsx-merc')} viewBox="0 0 48 48">
      <defs>
        <filter id={gooId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" />
          <feColorMatrix
            in="b"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -12"
          />
        </filter>
      </defs>
      <g filter={`url(#${gooId})`} fill="currentColor">
        <circle cx="24" cy="24" r="7.2" />
        <g className="fsx-merc__rotor">
          {FIFTHS.map((angle, i) => (
            <g key={angle} transform={`rotate(${angle} 24 24)`}>
              <circle
                className="fsx-merc__drop"
                cx="24"
                cy="24"
                r="5.2"
                style={{ animationDelay: DROP_DELAYS[i] }}
              />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 03 — Tide
 * The mark as a vessel. Two wave fronts drift across each other at
 * different speeds and opposite directions while the level rises and
 * falls, so the surface never repeats the same way twice. The mark is
 * the clip path — swap MARK_PATH and the liquid takes the new shape for
 * free. Splash screens and cold start. Needs 48px.
 * ------------------------------------------------------------------ */

const WAVE_PATH =
  'M-48 8 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 ' +
  't12 0 t12 0 t12 0 V56 H-48 Z';

export function Tide(props: LiquidSpinnerProps) {
  const clipId = useSvgId();

  return (
    <svg {...shell(props, 'fsx-svg fsx-tide')} viewBox="0 0 48 48">
      <defs>
        <clipPath id={clipId}>
          <path d={MARK_PATH} />
        </clipPath>
      </defs>
      <path className="fsx-tide__vessel" d={MARK_PATH} fill="currentColor" />
      <g clipPath={`url(#${clipId})`}>
        <g className="fsx-tide__level">
          <path
            className="fsx-tide__wave fsx-tide__wave--back"
            d={WAVE_PATH}
            fill="currentColor"
          />
          <path className="fsx-tide__wave" d={WAVE_PATH} fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 04 — Lens
 * A single glass capsule running a hairline track, magnifying and
 * brightening whatever it passes over. The one that behaves best on a
 * busy surface, because it borrows its colour from the content
 * underneath instead of imposing one. Needs 28px.
 * ------------------------------------------------------------------ */

export function Lens(props: LiquidSpinnerProps) {
  return (
    <div {...shell(props, 'fsx fsx-lens')}>
      <div className="fsx-lens__track" />
      <div className="fsx-lens__arm">
        <div className="fsx-lens__pill" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 05 — Facet
 * The mark held at low opacity while a bar of light travels across it,
 * then rests before coming round again. Inline and in headers. Needs
 * 24px.
 * ------------------------------------------------------------------ */

export function Facet(props: LiquidSpinnerProps) {
  const id = useSvgId();
  const clipId = `${id}-clip`;
  const sheenId = `${id}-sheen`;

  return (
    <svg {...shell(props, 'fsx-svg fsx-facet')} viewBox="0 0 48 48">
      <defs>
        <clipPath id={clipId}>
          <path d={MARK_PATH} />
        </clipPath>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset=".45" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="fsx-facet__base" d={MARK_PATH} fill="currentColor" />
      <g clipPath={`url(#${clipId})`}>
        <rect
          className="fsx-facet__sweep"
          x="-48"
          y="0"
          width="48"
          height="48"
          fill={`url(#${sheenId})`}
        />
      </g>
    </svg>
  );
}
