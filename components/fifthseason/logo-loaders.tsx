'use client';

import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

import {
  MARK,
  MARK_VIEWBOX,
  MarkGradients,
  MarkShapes,
  useSvgId,
} from './brand';

/**
 * Fifth Season loaders, built from the official mark.
 *
 * Five continuous indicators. Each animates the real artwork — the four
 * circles and the centre star, each addressable — rather than a stand-in.
 * Pure SVG and CSS; keyframes live in `app/globals.css` under "Fifth Season
 * motion".
 */

export type LogoLoaderProps = {
  /** Rendered size in px. Also settable in CSS via `--fsl-size`. */
  size?: number;
  /** Speed multiplier; 1 is the designed tempo. Also `--fsl-speed`. */
  speed?: number;
  /** Accessible name. Pass `null` when visible text already says it. */
  label?: string | null;
  className?: string;
};

function shell(
  { size, speed, label = 'Loading', className }: LogoLoaderProps,
  variant: string,
) {
  const style = {
    ...(size !== undefined && { '--fsl-size': `${size}px` }),
    ...(speed !== undefined && { '--fsl-speed': `${speed}` }),
  } as CSSProperties;

  return {
    viewBox: MARK_VIEWBOX,
    style,
    className: cn('fsl', variant, className),
    ...(label === null
      ? { 'aria-hidden': true }
      : { role: 'status', 'aria-label': label }),
  } as const;
}

/* ------------------------------------------------------------------ *
 * 01 — Quadrant
 * The four circles wake in turn, clockwise from the green, while the
 * centre holds a steady pulse. The one a first-time visitor reads as
 * the logo instantly. The default. 24px and up.
 * ------------------------------------------------------------------ */

export function Quadrant(props: LogoLoaderProps) {
  const uid = useSvgId();
  return (
    <svg {...shell(props, 'fsl-quadrant')}>
      <defs>
        <MarkGradients uid={uid} />
      </defs>
      <MarkShapes uid={uid} cellClassName="q-cell" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 02 — Aurora
 * The mark is four-fold symmetric, so turning it leaves the silhouette
 * untouched and moves only the colour. It spins without ever looking
 * like it is spinning. 32px and up.
 * ------------------------------------------------------------------ */

export function Aurora(props: LogoLoaderProps) {
  const uid = useSvgId();
  return (
    <svg {...shell(props, 'fsl-aurora')}>
      <defs>
        <MarkGradients uid={uid} />
      </defs>
      <g className="a-rotor">
        <path d={MARK.tl} fill={`url(#${uid}-tl)`} />
        <path d={MARK.tr} fill={`url(#${uid}-tr)`} />
        <path d={MARK.br} fill={`url(#${uid}-br)`} />
        <path d={MARK.bl} fill={`url(#${uid}-bl)`} />
      </g>
      <path d={MARK.star} fill={`url(#${uid}-star)`} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 03 — Converge
 * The four seasons draw in toward the centre and release, and the fifth
 * swells as they close on it. A breath rather than a rotation — the
 * register for something thinking, not merely fetching. 32px and up.
 * ------------------------------------------------------------------ */

export function Converge(props: LogoLoaderProps) {
  const uid = useSvgId();
  return (
    <svg {...shell(props, 'fsl-converge')}>
      <defs>
        <MarkGradients uid={uid} />
      </defs>
      <path className="c-in c-tl" d={MARK.tl} fill={`url(#${uid}-tl)`} />
      <path className="c-in c-tr" d={MARK.tr} fill={`url(#${uid}-tr)`} />
      <path className="c-in c-br" d={MARK.br} fill={`url(#${uid}-br)`} />
      <path className="c-in c-bl" d={MARK.bl} fill={`url(#${uid}-bl)`} />
      <path className="c-star" d={MARK.star} fill={`url(#${uid}-star)`} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 04 — Tide
 * The whole silhouette becomes a vessel. Two wave fronts drift across
 * each other while the level rises and falls. The liquid is the mark's
 * own colour revealed through a wave-shaped mask, not a substitute fill
 * laid over the top. 48px and up.
 * ------------------------------------------------------------------ */

const WAVE =
  'M-442 120 q55 -34 110 0 t110 0 t110 0 t110 0 t110 0 t110 0 t110 0 ' +
  't110 0 t110 0 t110 0 t110 0 t110 0 V520 H-442 Z';

export function Tide(props: LogoLoaderProps) {
  const uid = useSvgId();
  return (
    <svg {...shell(props, 'fsl-tide')}>
      <defs>
        <MarkGradients uid={uid} />
        <mask
          id={`${uid}-mask`}
          maskUnits="userSpaceOnUse"
          x="-442"
          y="-442"
          width="1326"
          height="1326"
        >
          <g className="t-level">
            <path className="t-wave" d={WAVE} fill="#fff" />
            <path
              className="t-wave t-wave--back"
              d={WAVE}
              fill="#fff"
              opacity=".45"
            />
          </g>
        </mask>
      </defs>
      <g opacity=".15">
        <MarkShapes uid={uid} />
      </g>
      <g mask={`url(#${uid}-mask)`}>
        <MarkShapes uid={uid} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 05 — Prism
 * Everything holds still and a band of light travels the diagonal the
 * gradient already runs along. The logo stays perfectly legible, which
 * makes this the one safe beside a wordmark in a header. 20px and up.
 * ------------------------------------------------------------------ */

export function Prism(props: LogoLoaderProps) {
  const uid = useSvgId();
  return (
    <svg {...shell(props, 'fsl-prism')}>
      <defs>
        <MarkGradients uid={uid} />
        <clipPath id={`${uid}-clip`}>
          <path d={MARK.tl} />
          <path d={MARK.tr} />
          <path d={MARK.br} />
          <path d={MARK.bl} />
          <path d={MARK.star} />
        </clipPath>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <MarkShapes uid={uid} />
      <g clipPath={`url(#${uid}-clip)`}>
        <rect
          className="p-sweep"
          x="-460"
          y="-120"
          width="380"
          height="700"
          fill={`url(#${uid}-sheen)`}
          transform="rotate(-38 221 221)"
        />
      </g>
    </svg>
  );
}
