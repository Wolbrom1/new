'use client';

import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

import { cn } from '@/lib/utils';

/**
 * The Fifth Season mark as a voice indicator: one animation per state.
 *
 *   listening — rings close in on the mark; the circles lean out and sway
 *   thinking  — the circles turn a quarter at a time; the star ticks round
 *   speaking  — rings radiate out; the circles push in a syllable rhythm
 *
 * The three Lotties live in /public/brand/lottie and are generated from the
 * official mark paths (see the GIF exports next to them for design review).
 * All three are mounted at once and cross-faded, so a state change never
 * waits on a fetch or flashes an empty frame; only the visible one plays.
 *
 * `level` (0–1) is the live audio level — mic input while listening, TTS
 * output while speaking. A Lottie cannot hear, so the level is applied on
 * top: it swells the mark, so the indicator answers the actual voice rather
 * than playing the same loop at a whisper and a shout.
 */

export type VoiceState = 'listening' | 'thinking' | 'speaking';

const STATES: VoiceState[] = ['listening', 'thinking', 'speaking'];

export type VoiceMarkProps = {
  state: VoiceState;
  /** Live audio level 0–1. Ignored while thinking. */
  level?: number;
  size?: number;
  className?: string;
};

const LABELS: Record<VoiceState, string> = {
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
};

export function VoiceMark({
  state,
  level = 0,
  size = 160,
  className,
}: VoiceMarkProps) {
  const hosts = useRef<Record<VoiceState, HTMLDivElement | null>>({
    listening: null,
    thinking: null,
    speaking: null,
  });
  const anims = useRef<Partial<Record<VoiceState, AnimationItem>>>({});
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // lottie-web touches `document` at import time, so it loads on the client.
    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled) return;
      for (const s of STATES) {
        const container = hosts.current[s];
        if (!container) continue;
        const anim = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: false,
          path: `/brand/lottie/fifthseason-${s}.json`,
        });
        anims.current[s] = anim;
        anim.addEventListener('DOMLoaded', () => {
          if (s === stateRef.current && !reduced) anim.play();
        });
      }
    });

    return () => {
      cancelled = true;
      for (const a of Object.values(anims.current)) a?.destroy();
      anims.current = {};
    };
  }, []);

  // Play only the visible state; the others hold still behind the fade.
  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    for (const s of STATES) {
      const a = anims.current[s];
      if (!a) continue;
      if (s === state && !reduced) a.play();
      else a.pause();
    }
  }, [state]);

  const swell =
    state === 'thinking' ? 1 : 1 + 0.08 * Math.min(1, Math.max(0, level));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={LABELS[state]}
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{ transform: `scale(${swell})` }}
      >
        {STATES.map((s) => (
          <div
            key={s}
            ref={(el) => {
              hosts.current[s] = el;
            }}
            aria-hidden
            className="absolute inset-0 transition-opacity duration-300 ease-out"
            style={{ opacity: s === state ? 1 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}
