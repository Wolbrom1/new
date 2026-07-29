'use client';

import { cn } from '@/lib/utils';

import {
  LOCKUP_MARK_SCALE,
  LOCKUP_VIEWBOX,
  MARK,
  MarkGradients,
  MarkShapes,
  MarkSilhouette,
  WORDMARK_GLYPHS,
  useSvgId,
} from './brand';

/**
 * Fifth Season openings — one-shot entrances for the full lockup.
 *
 * These run once on mount and then hold at their finished state, so they
 * are for a front page, a splash or an auth handoff, not for waiting.
 * Under `prefers-reduced-motion` the whole set resolves immediately to the
 * static lockup.
 *
 * Every one accepts a `replayKey`: change it and the animation restarts.
 */

export type OpeningProps = {
  /** Change this to replay the animation from the top. */
  replayKey?: number | string;
  className?: string;
  title?: string | null;
};

/**
 * Replay is a remount: returning a root element whose key changed makes React
 * drop the old subtree, and the CSS animations start again from zero. No state
 * and no effect — an effect that bumps a key on mount would remount every one
 * of these once for nothing.
 */
function replayOf(props: OpeningProps) {
  return props.replayKey ?? 'initial';
}

/**
 * Attributes are applied one by one rather than spread. `{...attrs} key={…}`
 * on the same element forces React down the `createElement` path, and that
 * path demands a key on every static child of the <svg> — which produces a
 * bogus "unique key" warning for markup that never needed keys at all.
 * Either alone is fine; together they are not.
 */
function openingAttrs({ className, title = 'Fifth Season' }: OpeningProps) {
  return {
    className: cn('fsw', className),
    role: title === null ? undefined : ('img' as const),
    ariaLabel: title === null ? undefined : title,
    ariaHidden: title === null ? (true as const) : undefined,
  };
}

const MARK_TRANSFORM = `scale(${LOCKUP_MARK_SCALE}) translate(-5 -5)`;
const ALL_WORD = WORDMARK_GLYPHS;

/* ------------------------------------------------------------------ *
 * 01 — Assemble
 * Each circle arrives from the corner it belongs to, overshoots and
 * settles. The centre lands last because it is the piece the other four
 * make between them. ~1.5s.
 * ------------------------------------------------------------------ */

export function Assemble(props: OpeningProps) {
  const uid = useSvgId();
  const a = openingAttrs(props);
  return (
    <svg
      key={replayOf(props)}
      viewBox={LOCKUP_VIEWBOX}
      className={a.className}
      role={a.role}
      aria-label={a.ariaLabel}
      aria-hidden={a.ariaHidden}
    >
      <defs>
        <MarkGradients uid={uid} />
      </defs>
      <g transform={MARK_TRANSFORM}>
        <g className="as">
          <MarkShapes uid={uid} cellClassName="as-cell" />
        </g>
      </g>
      <g className="fsw-word as-word" fill="currentColor">
        {ALL_WORD.map((g) => (
          <path key={g.id} d={g.d} />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 02 — Iris
 * The mark opens from nothing at the centre outward, then the wordmark
 * cascades a letter at a time. The safest on a marketing page. ~1.6s.
 * ------------------------------------------------------------------ */

export function Iris(props: OpeningProps) {
  const uid = useSvgId();
  const a = openingAttrs(props);
  return (
    <svg
      key={replayOf(props)}
      viewBox={LOCKUP_VIEWBOX}
      className={a.className}
      role={a.role}
      aria-label={a.ariaLabel}
      aria-hidden={a.ariaHidden}
    >
      <defs>
        <MarkGradients uid={uid} />
      </defs>
      <g transform={MARK_TRANSFORM}>
        <g className="ir">
          <MarkShapes uid={uid} cellClassName="ir-cell" />
        </g>
      </g>
      <g className="fsw-word" fill="currentColor">
        {ALL_WORD.map((g, i) => (
          <path
            key={g.id}
            className="ir-l"
            style={{ '--i': i } as React.CSSProperties}
            d={g.d}
          />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 03 — Sweep
 * The mark is already there in grey when the page paints, and a wash of
 * light travels the gradient diagonal to leave colour behind it.
 * Nothing moves position, so it never shifts the layout. ~1.8s.
 * ------------------------------------------------------------------ */

export function Sweep(props: OpeningProps) {
  const uid = useSvgId();
  const a = openingAttrs(props);
  return (
    <svg
      key={replayOf(props)}
      viewBox={LOCKUP_VIEWBOX}
      className={a.className}
      role={a.role}
      aria-label={a.ariaLabel}
      aria-hidden={a.ariaHidden}
    >
      <defs>
        <MarkGradients uid={uid} />
        <clipPath id={`${uid}-clip`}>
          <MarkSilhouette />
        </clipPath>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={MARK_TRANSFORM}>
        <g className="sw-grey" fill="currentColor">
          <MarkSilhouette />
        </g>
        <g className="sw-colour">
          <MarkShapes uid={uid} />
        </g>
        <g clipPath={`url(#${uid}-clip)`}>
          <rect
            className="sw-band"
            x="-460"
            y="-120"
            width="300"
            height="700"
            fill={`url(#${uid}-sheen)`}
            transform="rotate(-38 221 221)"
          />
        </g>
      </g>
      <g className="fsw-word sw-word" fill="currentColor">
        {ALL_WORD.map((g) => (
          <path key={g.id} d={g.d} />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 04 — Unfold
 * The circles come in already turning, a quarter-turn out of place, and
 * spring into register. Because the mark is four-fold symmetric the turn
 * resolves exactly. ~1.4s.
 * ------------------------------------------------------------------ */

export function Unfold(props: OpeningProps) {
  const uid = useSvgId();
  const a = openingAttrs(props);
  return (
    <svg
      key={replayOf(props)}
      viewBox={LOCKUP_VIEWBOX}
      className={a.className}
      role={a.role}
      aria-label={a.ariaLabel}
      aria-hidden={a.ariaHidden}
    >
      <defs>
        <MarkGradients uid={uid} />
      </defs>
      <g transform={MARK_TRANSFORM}>
        <g className="un">
          <MarkShapes uid={uid} />
        </g>
      </g>
      <g className="fsw-word un-word" fill="currentColor">
        {ALL_WORD.map((g) => (
          <path key={g.id} d={g.d} />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 05 — Rise
 * Colour floods the silhouette from below like a tide coming in, and the
 * wordmark surfaces behind it. The one to use when the logo is the only
 * thing on screen. ~2.2s.
 * ------------------------------------------------------------------ */

export function Rise(props: OpeningProps) {
  const uid = useSvgId();
  const a = openingAttrs(props);
  return (
    <svg
      key={replayOf(props)}
      viewBox={LOCKUP_VIEWBOX}
      className={a.className}
      role={a.role}
      aria-label={a.ariaLabel}
      aria-hidden={a.ariaHidden}
    >
      <defs>
        <MarkGradients uid={uid} />
        <clipPath id={`${uid}-clip`}>
          <MarkSilhouette />
        </clipPath>
      </defs>
      <g transform={MARK_TRANSFORM}>
        <g opacity=".13">
          <MarkShapes uid={uid} />
        </g>
        <g clipPath={`url(#${uid}-clip)`}>
          <g className="ri-level">
            <MarkShapes uid={uid} />
          </g>
        </g>
      </g>
      <g className="fsw-word ri-word" fill="currentColor">
        {ALL_WORD.map((g) => (
          <path key={g.id} d={g.d} />
        ))}
      </g>
    </svg>
  );
}

/** Handy when only the mark path is needed for a custom sequence. */
export { MARK };
