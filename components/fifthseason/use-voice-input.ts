'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Microphone dictation for the chat input.
 *
 * Two things run side by side while listening:
 *   - an AnalyserNode on the mic stream, sampled every animation frame, that
 *     reports a 0–1 `level` — this is what makes VoiceMark answer the voice
 *   - the browser's speech recognition, which streams the transcript
 *
 * Supported where the Web Speech API is (Chrome, Edge, Safari). Elsewhere
 * `supported` is false and the mic button should not render.
 *
 * Data handling: browsers implement speech recognition with their own cloud
 * service — Chrome sends the audio to Google, Safari to Apple. Set
 * NEXT_PUBLIC_FS_DICTATION=off to hide dictation where that is not
 * acceptable. The level meter never leaves the device.
 */

const DICTATION_ENABLED = process.env.NEXT_PUBLIC_FS_DICTATION !== 'off';

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

function recognitionCtor(): (new () => Recognition) | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => Recognition)
    | undefined;
}

export function useVoiceInput({
  onTranscript,
}: {
  /** Called with the full transcript so far, interim words included. */
  onTranscript: (text: string) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const frame = useRef(0);
  const rec = useRef<Recognition | null>(null);
  const emit = useRef(onTranscript);
  emit.current = onTranscript;

  useEffect(() => {
    setSupported(
      DICTATION_ENABLED &&
        Boolean(recognitionCtor()) &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    );
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    rec.current?.stop();
    rec.current = null;
    for (const t of stream.current?.getTracks() ?? []) t.stop();
    stream.current = null;
    ctx.current?.close();
    ctx.current = null;
    setLevel(0);
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    setError(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch {
      setError(
        'Microphone access was blocked. Allow it in the browser to dictate.',
      );
      return;
    }

    // Level meter: RMS of the waveform, eased so the mark swells smoothly.
    ctx.current = new AudioContext();
    const analyser = ctx.current.createAnalyser();
    analyser.fftSize = 512;
    ctx.current.createMediaStreamSource(stream.current).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    let eased = 0;
    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      eased += (Math.min(1, rms * 6) - eased) * 0.25;
      setLevel(eased);
      frame.current = requestAnimationFrame(tick);
    };
    tick();

    const r = new Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = navigator.language || 'en-US';
    let finalText = '';
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interim += res[0].transcript;
      }
      emit.current((finalText + interim).trim());
    };
    r.onerror = (e) => {
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        setError('Dictation stopped. Try again, or type instead.');
      }
    };
    r.onend = () => stop();
    rec.current = r;
    r.start();
    setListening(true);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { supported, listening, level, error, start, stop };
}
