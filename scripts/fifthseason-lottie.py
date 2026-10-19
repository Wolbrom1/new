"""Generate Fifth Season voice-state Lotties from the official mark paths.

Reads the five subpaths out of components/fifthseason/brand.tsx, converts each
to Lottie bezier form exactly (the source is cubic-only), and writes three
seamlessly looping animations: listening, thinking, speaking.
"""
import json
import math
import re
import sys

BRAND = sys.argv[1]
OUT = sys.argv[2]

src = open(BRAND).read()
PATHS = {k: re.search(k + r": '([^']+)'", src).group(1) for k in ['star', 'tl', 'tr', 'bl', 'br']}

# ---------------------------------------------------------------- geometry
W = H = 512
FPS = 60
MARK_C = 221.22
K = 300 / 432.44  # mark drawn ~300px wide on a 512 canvas


def to_canvas(x, y):
    return [round((x - MARK_C) * K + W / 2, 3), round((y - MARK_C) * K + H / 2, 3)]


NUM = re.compile(r'[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?')


def parse(d):
    """Cubic-only SVG path -> list of (p0, c1, c2, p3) absolute segments."""
    toks = re.findall(r'[MmCcSsZz]|' + NUM.pattern, d)
    i, cur, start, prev_c2, segs, cmd = 0, (0, 0), (0, 0), None, [], None
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t
            i += 1
            if cmd in 'Zz':
                if math.dist(cur, start) > 1e-3:
                    segs.append((cur, cur, start, start))
                cur, prev_c2 = start, None
            continue
        n = [float(x) for x in toks[i:i + {'M': 2, 'm': 2, 'C': 6, 'c': 6, 'S': 4, 's': 4}[cmd]]]
        i += len(n)
        if cmd in 'Mm':
            cur = (n[0], n[1]) if cmd == 'M' else (cur[0] + n[0], cur[1] + n[1])
            start, prev_c2 = cur, None
            continue
        rel = cmd.islower()
        ox, oy = (cur if rel else (0, 0))
        if cmd in 'Cc':
            c1 = (ox + n[0], oy + n[1]); c2 = (ox + n[2], oy + n[3]); p3 = (ox + n[4], oy + n[5])
        else:
            c1 = (2 * cur[0] - prev_c2[0], 2 * cur[1] - prev_c2[1]) if prev_c2 else cur
            c2 = (ox + n[0], oy + n[1]); p3 = (ox + n[2], oy + n[3])
        segs.append((cur, c1, c2, p3))
        cur, prev_c2 = p3, c2
    return segs


def lottie_shape(d):
    segs = parse(d)
    v, ii, oo = [], [], []
    for p0, c1, c2, p3 in segs:
        v.append(to_canvas(*p0))
        oo.append([round((c1[0] - p0[0]) * K, 3), round((c1[1] - p0[1]) * K, 3)])
    # in-tangent of vertex j comes from the segment that ends at it
    for j in range(len(segs)):
        p0, c1, c2, p3 = segs[j - 1]
        ii.append([round((c2[0] - p3[0]) * K, 3), round((c2[1] - p3[1]) * K, 3)])
    return {'ty': 'sh', 'nm': 'path', 'ks': {'a': 0, 'k': {'i': ii, 'o': oo, 'v': v, 'c': True}}}


# brand gradients (same stops as MarkGradients in brand.tsx), mark coords
GRADS = {
    'tl': ((109, 5), (109, 214), [(0, '#A0DC96'), (.407, '#92D1A9'), (.598, '#85C4BC'), (.789, '#79B6CA'), (1, '#6DA1CE')]),
    'tr': ((229, 5), (437, 214), [(0, '#B27FD1'), (.5, '#CE7CC7'), (1, '#EE79BB')]),
    'bl': ((109, 229), (109, 437), [(0, '#6080CA'), (.293, '#525DC2'), (.5, '#4C4FBA'), (.726, '#3D41A9'), (1, '#31359A')]),
    'br': ((229, 437), (437, 229), [(0, '#933D79'), (.159, '#9B4075'), (.293, '#9E4174'), (.5, '#B75970'), (.707, '#E48369'), (.841, '#F39166'), (1, '#F89A66')]),
    'star': ((221, 145), (221, 298), [(0, '#A098B9'), (.5, '#8D7BB6'), (1, '#775AAD')]),
}


def rgb(h):
    return [round(int(h[i:i + 2], 16) / 255, 4) for i in (1, 3, 5)]


def grad_fill(key):
    s, e, stops = GRADS[key]
    k = []
    for off, col in stops:
        k += [off] + rgb(col)
    return {'ty': 'gf', 'nm': 'brand gradient', 'o': {'a': 0, 'k': 100}, 'r': 1, 't': 1,
            'g': {'p': len(stops), 'k': {'a': 0, 'k': k}},
            's': {'a': 0, 'k': to_canvas(*s)}, 'e': {'a': 0, 'k': to_canvas(*e)}}


TR = {'ty': 'tr', 'p': {'a': 0, 'k': [0, 0]}, 'a': {'a': 0, 'k': [0, 0]}, 's': {'a': 0, 'k': [100, 100]},
      'r': {'a': 0, 'k': 0}, 'o': {'a': 0, 'k': 100}, 'sk': {'a': 0, 'k': 0}, 'sa': {'a': 0, 'k': 0}}

CENTRES = {'tl': (109.26, 109.26), 'tr': (333.18, 109.26), 'bl': (109.26, 333.18), 'br': (333.18, 333.18), 'star': (MARK_C, MARK_C)}
DIAG = {'tl': (-1, -1), 'tr': (1, -1), 'bl': (-1, 1), 'br': (1, 1), 'star': (0, 0)}


# ---------------------------------------------------------------- animation
def sampled(fn, op, step=2):
    """Animate a property by sampling fn(t in 0..1) — periodic fn => seamless loop."""
    keys = []
    frames = list(range(0, op, step)) + [op]
    for f in frames:
        val = fn(f / op)
        val = val if isinstance(val, list) else [val]
        keys.append({'t': f, 's': [round(x, 3) for x in val],
                     'i': {'x': [0.5] * len(val), 'y': [0.5] * len(val)},
                     'o': {'x': [0.5] * len(val), 'y': [0.5] * len(val)}})
    keys[-1] = {'t': op, 's': keys[-1]['s']}
    return {'a': 1, 'k': keys}


def static(v):
    return {'a': 0, 'k': v}


def shape_layer(ind, nm, key, op, pos=None, scale=None, rot=None, opac=None, parent=None):
    cx, cy = to_canvas(*CENTRES[key])
    ks = {'o': opac or static(100), 'r': rot or static(0),
          'p': pos or static([cx, cy, 0]), 'a': static([cx, cy, 0]),
          's': scale or static([100, 100, 100])}
    layer = {'ddd': 0, 'ind': ind, 'ty': 4, 'nm': nm, 'sr': 1, 'ks': ks, 'ao': 0,
             'shapes': [{'ty': 'gr', 'nm': nm, 'it': [lottie_shape(PATHS[key]), grad_fill(key), TR]}],
             'ip': 0, 'op': op, 'st': 0, 'bm': 0}
    if parent:
        layer['parent'] = parent
    return layer


def ring_layer(ind, nm, colour, op, size_fn, opac_fn, width=3.5):
    return {'ddd': 0, 'ind': ind, 'ty': 4, 'nm': nm, 'sr': 1, 'ao': 0, 'ip': 0, 'op': op, 'st': 0, 'bm': 0,
            'ks': {'o': sampled(opac_fn, op), 'r': static(0), 'p': static([W / 2, H / 2, 0]),
                   'a': static([0, 0, 0]), 's': static([100, 100, 100])},
            'shapes': [{'ty': 'gr', 'nm': nm, 'it': [
                {'ty': 'el', 'p': static([0, 0]), 's': sampled(lambda t: [size_fn(t)] * 2, op)},
                {'ty': 'st', 'c': static(rgb(colour) + [1]), 'o': static(100), 'w': static(width), 'lc': 2, 'lj': 2},
                TR]}]}


def null_layer(ind, op, rot=None, scale=None):
    return {'ddd': 0, 'ind': ind, 'ty': 3, 'nm': 'rig', 'sr': 1, 'ao': 0, 'ip': 0, 'op': op, 'st': 0, 'bm': 0,
            'ks': {'o': static(0), 'r': rot or static(0), 'p': static([W / 2, H / 2, 0]),
                   'a': static([W / 2, H / 2, 0]), 's': scale or static([100, 100, 100])}}


def comp(nm, op, layers):
    return {'v': '5.7.4', 'fr': FPS, 'ip': 0, 'op': op, 'w': W, 'h': H, 'nm': nm, 'ddd': 0,
            'assets': [], 'layers': layers}


TAU = 2 * math.pi
ease = lambda x: x * x * (3 - 2 * x)  # noqa: E731


def drift(key, amp_fn):
    """Position that pushes a circle out along its own diagonal by amp_fn(t) px."""
    cx, cy = to_canvas(*CENTRES[key])
    dx, dy = DIAG[key]
    return sampled(lambda t: [cx + dx * amp_fn(t) * .7071, cy + dy * amp_fn(t) * .7071, 0], OPS[key_op])


# ------------------------------------------------------------ 1. listening
# Sound arriving: rings close in on the mark from outside; the four circles
# lean outward a little and sway, like something leaning in to hear.
op = int(FPS * 2.4)
OPS = {}
key_op = 'listen'
OPS['listen'] = op

def listen_amp(phase):
    return lambda t: 7 + 4 * math.sin(TAU * t + phase) + 2 * math.sin(TAU * 2 * t + phase * 1.7)

def ring_in(offset):
    def size(t):
        u = (t + offset) % 1
        return 470 - 190 * ease(u)
    def opac(t):
        u = (t + offset) % 1
        return 90 * math.sin(math.pi * u) ** 1.5
    return size, opac

layers = []
for i, k in enumerate(['tl', 'tr', 'br', 'bl']):
    layers.append(shape_layer(i + 1, k, k, op, pos=drift(k, listen_amp(i * 1.3))))
layers.append(shape_layer(5, 'star', 'star', op,
                          scale=sampled(lambda t: [96 + 3 * math.sin(TAU * t)] * 2 + [100], op)))
for j, (off, col) in enumerate([(0, '#6DA1CE'), (1 / 3, '#92D1A9'), (2 / 3, '#6080CA')]):
    sz, oc = ring_in(off)
    layers.append(ring_layer(6 + j, f'ring {j}', col, op, sz, oc))
listening = comp('Fifth Season — Listening', op, layers)

# ------------------------------------------------------------- 2. thinking
# The four circles turn about the centre a quarter at a time and gather in on
# each turn; the star turns the other way, continuously. Four quarter-turns
# per loop so the colours return home and the loop is seamless.
op = int(FPS * 3.6)
OPS['think'] = op
key_op = 'think'

def stepped_turn(t):
    q = t * 4
    k, f = int(q), q - int(q)
    move = min(f / .62, 1)  # 62% of each quarter moves, the rest holds
    # ease-in-out with a small settle
    e = ease(move) + .06 * math.sin(math.pi * move) * (1 - move) * 3 if move < 1 else 1
    return 90 * (k + e)

def gather(t):
    f = (t * 4) % 1
    return 100 - 9 * math.sin(math.pi * min(f / .62, 1))

layers = [null_layer(1, op, rot=sampled(lambda t: stepped_turn(t), op),
                     scale=sampled(lambda t: [gather(t), gather(t), 100], op))]
for i, k in enumerate(['tl', 'tr', 'br', 'bl']):
    layers.append(shape_layer(i + 2, k, k, op, parent=1))
layers.append(shape_layer(6, 'star', 'star', op,
                          rot=sampled(lambda t: -180 * t, op),
                          # shrink at the 45-degree points so the star's arms clear the circles
                          scale=sampled(lambda t: [70 + 30 * abs(math.cos(2 * math.radians(180 * t)))] * 2 + [100], op)))
# star sits on top of the circles while it turns
layers = [layers[0], layers[5]] + layers[1:5]
thinking = comp('Fifth Season — Thinking', op, layers)

# ------------------------------------------------------------- 3. speaking
# Sound leaving: rings radiate out from the mark, and the circles push out in
# a syllable rhythm. The envelope is a sum of harmonics of the loop length, so
# it is irregular enough to read as speech and still loops exactly.
op = int(FPS * 2.0)
OPS['speak'] = op
key_op = 'speak'

def envelope(t, ph=0.0):
    e = (.55 + .28 * math.sin(TAU * 3 * t + ph) + .18 * math.sin(TAU * 5 * t + 1.1 + ph)
         + .12 * math.sin(TAU * 8 * t + 2.3 + ph * .5))
    return max(0, min(1, e))

def ring_out(offset):
    def size(t):
        u = (t + offset) % 1
        return 300 + 200 * (1 - (1 - u) ** 2)
    def opac(t):
        u = (t + offset) % 1
        return 90 * (1 - u) ** 1.6
    return size, opac

layers = []
for i, k in enumerate(['tl', 'tr', 'br', 'bl']):
    layers.append(shape_layer(i + 1, k, k, op, pos=drift(k, lambda t, ph=i * .9: 2 + 26 * envelope(t, ph)),
                              scale=sampled(lambda t, ph=i * .9: [95 + 9 * envelope(t, ph)] * 2 + [100], op)))
layers.append(shape_layer(5, 'star', 'star', op,
                          scale=sampled(lambda t: [92 + 20 * envelope(t, .4)] * 2 + [100], op)))
for j, (off, col) in enumerate([(0, '#EE79BB'), (1 / 3, '#F89A66'), (2 / 3, '#B27FD1')]):
    sz, oc = ring_out(off)
    layers.append(ring_layer(6 + j, f'ring {j}', col, op, sz, oc))
speaking = comp('Fifth Season — Speaking', op, layers)

for name, data in [('listening', listening), ('thinking', thinking), ('speaking', speaking)]:
    with open(f'{OUT}/fifthseason-{name}.json', 'w') as fh:
        json.dump(data, fh, separators=(',', ':'))
    print(name, data['op'], 'frames', len(json.dumps(data, separators=(',', ':'))) // 1024, 'KB')
