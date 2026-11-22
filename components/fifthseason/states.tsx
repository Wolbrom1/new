'use client';

import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

import { cn } from '@/lib/utils';

import { MARK, MARK_VIEWBOX, MarkGradients, useSvgId } from './brand';

/**
 * Fifth Season platform states — the small pieces every surface needs.
 *
 *   MarkSpinner        the inline spinner: buttons, rows, uploads, headers
 *   ThinkingIndicator  "the model is working" — the mark plus a shimmered label
 *   ProgressBar        determinate or indeterminate, in the brand gradient
 *   LottieState        plays any of the brand Lotties (success, error, …)
 *
 * Skeletons are a CSS class, `fs-skeleton`, so existing markup only swaps a
 * class name. Keyframes for all of these live in app/globals.css under
 * "Fifth Season platform states".
 */

/* ------------------------------------------------------------------ *
 * MarkSpinner
 * The real mark, tuned for 12–20px. The four circles chase clockwise —
 * a spinner people read as "busy" without thinking — while the shape
 * never moves, so it stays recognisably the logo at icon size.
 * `tone="mono"` draws it in currentColor for tinted or inverted buttons.
 * ------------------------------------------------------------------ */

export function MarkSpinner({
  size = 16,
  tone = 'brand',
  label = 'Loading',
  className,
}: {
  size?: number;
  tone?: 'brand' | 'mono';
  /** Accessible name. Pass `null` when nearby text already says it. */
  label?: string | null;
  className?: string;
}) {
  const uid = useSvgId();
  const fill = (k: keyof typeof MARK) =>
    tone === 'mono' ? 'currentColor' : `url(#${uid}-${k})`;

  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={size}
      height={size}
      className={cn('fs-mark-spinner shrink-0', className)}
      role={label === null ? undefined : 'status'}
      aria-label={label === null ? undefined : label}
      aria-hidden={label === null ? true : undefined}
    >
      {tone === 'brand' && (
        <defs>
          <MarkGradients uid={uid} />
        </defs>
      )}
      <path className="ms-cell ms-1" d={MARK.tl} fill={fill('tl')} />
      <path className="ms-cell ms-2" d={MARK.tr} fill={fill('tr')} />
      <path className="ms-cell ms-3" d={MARK.br} fill={fill('br')} />
      <path className="ms-cell ms-4" d={MARK.bl} fill={fill('bl')} />
      <path d={MARK.star} fill={fill('star')} opacity={0.9} />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * ThinkingIndicator
 * The mark plus a label that a band of brand colour runs through.
 * Replaces the sparkle-and-"Hmm..." and the "Reasoning" spinner, so the
 * platform has one voice for "working on it".
 * ------------------------------------------------------------------ */

export function ThinkingIndicator({
  label = 'Thinking',
  size = 18,
  mark = true,
  className,
}: {
  label?: string;
  size?: number;
  /** Off when the mark is already shown nearby, e.g. in a message avatar. */
  mark?: boolean;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2', className)}
    >
      {mark && <MarkSpinner size={size} label={null} />}
      <span className="fs-shimmer-text font-medium">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * ProgressBar
 * Pass `value` (0–1) when you know how far along it is; leave it out and
 * the bar runs indeterminate. The fill is the brand gradient end to end,
 * green to orange, so a full bar is the whole palette.
 * ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  label = 'Progress',
  className,
}: {
  value?: number;
  label?: string;
  className?: string;
}) {
  const known = typeof value === 'number';
  const pct = known ? Math.round(Math.min(1, Math.max(0, value)) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={known ? pct : undefined}
      className={cn(
        'fs-progress relative h-1 w-full overflow-hidden rounded-full',
        className,
      )}
    >
      {known ? (
        <div
          className="fs-progress-fill h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      ) : (
        <div className="fs-progress-run absolute inset-y-0 w-2/5 rounded-full" />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * LottieState
 * Plays one of the brand Lotties from /public/brand/lottie. Loops by
 * default; pass `loop={false}` for the one-shot states (success, error),
 * which then hold their final frame. Under reduced motion it shows the
 * final frame and does not animate.
 * ------------------------------------------------------------------ */

export type BrandLottie =
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'flip'
  | 'tandem'
  | 'compass'
  | 'success'
  | 'error';

export function LottieState({
  name,
  loop = true,
  size = 96,
  label,
  className,
  onComplete,
}: {
  name: BrandLottie;
  loop?: boolean;
  size?: number;
  label?: string;
  className?: string;
  onComplete?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const done = useRef(onComplete);
  done.current = onComplete;

  useEffect(() => {
    let anim: AnimationItem | undefined;
    let cancelled = false;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // lottie-web touches `document` at import time, so it loads on the client.
    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !host.current) return;
      anim = lottie.loadAnimation({
        container: host.current,
        renderer: 'svg',
        loop: loop && !reduced,
        autoplay: !reduced,
        path: `/brand/lottie/fifthseason-${name}.json`,
      });
      if (reduced) {
        anim.addEventListener('DOMLoaded', () =>
          anim?.goToAndStop(anim.totalFrames - 1, true),
        );
      }
      anim.addEventListener('complete', () => done.current?.());
    });

    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, [name, loop]);

  return (
    <div
      ref={host}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
}
