import {
  Bloom,
  CycleBars,
  FifthOrbit,
  MarkPulse,
  SeasonRing,
} from '@/components/fifthseason/spinners';

export const metadata = {
  title: 'Fifthseason — Loader Set',
  description: 'Five loading indicators for Fifthseason.ai.',
};

const SPINNERS = [
  {
    num: '01',
    season: 'Spring',
    name: 'Bloom',
    note: 'Route transitions, empty states',
    tint: 'var(--season-1)',
    render: (tone: 'solid' | 'seasonal') => <Bloom size={64} tone={tone} />,
  },
  {
    num: '02',
    season: 'Summer',
    name: 'Cycle Bars',
    note: 'Streaming responses, pending buttons',
    tint: 'var(--season-2)',
    render: (tone: 'solid' | 'seasonal') => <CycleBars size={64} tone={tone} />,
  },
  {
    num: '03',
    season: 'Autumn',
    name: 'Fifth Orbit',
    note: 'Background jobs, polling, agent runs',
    tint: 'var(--season-3)',
    render: (tone: 'solid' | 'seasonal') => (
      <FifthOrbit size={64} tone={tone} />
    ),
  },
  {
    num: '04',
    season: 'Winter',
    name: 'Season Ring',
    note: 'The general-purpose default',
    tint: 'var(--season-4)',
    render: (tone: 'solid' | 'seasonal') => (
      <SeasonRing size={64} tone={tone} />
    ),
  },
  {
    num: '05',
    season: 'The Fifth Season',
    name: 'Mark Pulse',
    note: 'Splash, cold start, full-page loads',
    tint: 'var(--season-5)',
    render: (tone: 'solid' | 'seasonal') => <MarkPulse size={64} tone={tone} />,
  },
];

function Row({ tone }: { tone: 'solid' | 'seasonal' }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SPINNERS.map((spinner) => (
        <div
          key={spinner.num + tone}
          className="flex flex-col gap-4 rounded-xl border p-6"
          style={{ color: tone === 'solid' ? spinner.tint : undefined }}
        >
          <div className="flex min-h-24 items-center justify-center">
            {spinner.render(tone)}
          </div>
          <div className="text-foreground">
            <div className="flex items-baseline gap-2 font-mono text-sm">
              <span style={{ color: spinner.tint }}>{spinner.num}</span>
              <span className="font-semibold">{spinner.name}</span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {spinner.season}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{spinner.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SpinnersPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-mono text-3xl font-semibold tracking-tight">
        Four seasons turn. A fifth keeps loading.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Five loading indicators built on the archetypes catalogued at
        magecdn.com/tools/svg-loaders, rebuilt so that everything counts to
        five. Pure SVG and CSS — no animation library. Colour comes from{' '}
        <code className="font-mono text-sm">currentColor</code>.
      </p>

      <h2 className="mt-14 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Solid — inherits currentColor
      </h2>
      <div className="mt-4">
        <Row tone="solid" />
      </div>

      <h2 className="mt-14 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Seasonal — five parts, five seasons
      </h2>
      <div className="mt-4">
        <Row tone="seasonal" />
      </div>

      <h2 className="mt-14 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        At size — 16 / 24 / 40 / 64
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-10 rounded-xl border p-8">
        {[16, 24, 40, 64].map((size) => (
          <div key={size} className="flex items-center gap-4">
            <SeasonRing size={size} ticks={size >= 28} />
            <CycleBars size={size} />
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
        The glyph inside <span className="font-mono">Mark Pulse</span> is a
        placeholder standing in for the real Fifthseason.ai logo. Replace{' '}
        <span className="font-mono">FifthseasonMark</span> in{' '}
        <span className="font-mono">components/fifthseason/spinners.tsx</span>{' '}
        with the real path data and the set is complete.
      </p>
    </main>
  );
}
