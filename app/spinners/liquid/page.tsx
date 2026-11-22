import {
  Facet,
  Halo,
  Lens,
  Mercury,
  Tide,
} from '@/components/fifthseason/liquid';

export const metadata = {
  title: 'Fifthseason — Liquid Loaders',
  description: 'Five Apple-style glass and liquid loaders for Fifthseason.ai.',
};

const SET = [
  {
    num: '01',
    name: 'Halo',
    note: 'Glass ring, specular sweep. The default.',
    node: <Halo size={64} />,
  },
  {
    num: '02',
    name: 'Mercury',
    note: 'Metaballs that merge and part. Fluid.',
    node: <Mercury size={64} />,
  },
  {
    num: '03',
    name: 'Tide',
    note: 'The mark filling with liquid. Fluid.',
    node: <Tide size={72} />,
  },
  {
    num: '04',
    name: 'Lens',
    note: 'A glass capsule refracting what it passes.',
    node: <Lens size={64} />,
  },
  {
    num: '05',
    name: 'Facet',
    note: 'Light travelling across the mark.',
    node: <Facet size={64} />,
  },
];

export default function LiquidSpinnersPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden px-6 py-20">
      {/* Ambient blooms — the glass needs something real to refract. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        style={{
          background:
            'radial-gradient(30% 20% at 20% 12%, rgba(123,94,167,.30), transparent 70%),' +
            'radial-gradient(28% 18% at 82% 28%, rgba(74,127,165,.26), transparent 70%),' +
            'radial-gradient(32% 20% at 50% 72%, rgba(210,96,58,.16), transparent 72%)',
        }}
      />

      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-semibold tracking-tight">
          Five ways to wait, in glass and liquid.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Apple-style materials — real translucency, refraction, specular light
          and physical easing. Mercury and Tide are properly fluid. Halo and
          Lens use <code className="font-mono text-sm">backdrop-filter</code>,
          so they refract whatever sits behind them.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {SET.map((item) => (
            <div
              key={item.num}
              className="rounded-3xl border p-8 backdrop-blur-xl"
              style={{ background: 'rgba(255,255,255,.06)' }}
            >
              <div
                className="flex min-h-28 items-center justify-center"
                style={{ color: 'var(--accent)' }}
              >
                {item.node}
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {item.num}
                </span>
                <span className="text-lg font-semibold">{item.name}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-xl text-sm text-muted-foreground">
          Tide and Facet are shaped by the mark, which is a placeholder. Replace{' '}
          <span className="font-mono">MARK_PATH</span> in{' '}
          <span className="font-mono">components/fifthseason/liquid.tsx</span>{' '}
          with the real logo outline, normalised to a 48×48 box.
        </p>
      </div>
    </main>
  );
}
