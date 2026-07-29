'use client';

import { useState } from 'react';

import { BRAND, FifthSeasonLockup } from '@/components/fifthseason/brand';
import {
  Aurora,
  Converge,
  Prism,
  Quadrant,
  Tide,
} from '@/components/fifthseason/logo-loaders';
import {
  Assemble,
  Iris,
  Rise,
  Sweep,
  Unfold,
} from '@/components/fifthseason/logo-openings';

const LOADERS = [
  {
    name: 'Quadrant',
    note: 'The default. Buttons, tables, dialogs.',
    node: <Quadrant size={88} />,
  },
  {
    name: 'Aurora',
    note: 'Colour turns, the shape does not.',
    node: <Aurora size={88} />,
  },
  {
    name: 'Converge',
    note: 'Agent runs, reasoning, empty states.',
    node: <Converge size={88} />,
  },
  {
    name: 'Tide',
    note: 'Liquid. Long waits and uploads.',
    node: <Tide size={88} />,
  },
  {
    name: 'Prism',
    note: 'Stays legible. Headers and inline.',
    node: <Prism size={88} />,
  },
];

export default function LogoMotionPage() {
  const [replay, setReplay] = useState(0);

  const openings = [
    {
      name: 'Assemble',
      note: 'Each circle arrives from its own corner.',
      node: <Assemble replayKey={replay} />,
    },
    {
      name: 'Iris',
      note: 'Opens from the centre; letters cascade.',
      node: <Iris replayKey={replay} />,
    },
    {
      name: 'Sweep',
      note: 'Grey to colour. No layout shift.',
      node: <Sweep replayKey={replay} />,
    },
    {
      name: 'Unfold',
      note: 'A quarter-turn springs into register.',
      node: <Unfold replayKey={replay} />,
    },
    {
      name: 'Rise',
      note: 'Colour floods in from below.',
      node: <Rise replayKey={replay} />,
    },
  ];

  return (
    <main className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50 blur-3xl"
        style={{
          background: [
            `radial-gradient(30% 14% at 14% 6%, ${BRAND.green}, transparent 70%)`,
            `radial-gradient(28% 13% at 86% 16%, ${BRAND.pink}, transparent 70%)`,
            `radial-gradient(32% 14% at 46% 44%, ${BRAND.blue}, transparent 72%)`,
            `radial-gradient(30% 14% at 82% 74%, ${BRAND.orange}, transparent 70%)`,
          ].join(','),
        }}
      />

      <div className="mx-auto max-w-5xl">
        <FifthSeasonLockup className="w-56" />
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">
          The mark, in motion.
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Five loaders and five openings, built from the official artwork — the
          icon&apos;s own subpaths, filled with the brand gradient sampled off
          the master file.
        </p>

        <h2 className="mt-14 text-xs uppercase tracking-widest text-muted-foreground">
          Loaders — continuous
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOADERS.map((l) => (
            <div key={l.name} className="rounded-2xl border p-8">
              <div className="flex min-h-32 items-center justify-center">
                {l.node}
              </div>
              <p className="mt-6 font-semibold">{l.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex items-baseline gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Openings — one-shot
          </h2>
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            className="rounded-full border px-4 py-1 text-xs"
          >
            Replay all
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {openings.map((o) => (
            <div key={o.name} className="rounded-2xl border p-8">
              <div className="flex min-h-24 items-center">
                <div className="w-64">{o.node}</div>
              </div>
              <p className="mt-6 font-semibold">{o.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{o.note}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
