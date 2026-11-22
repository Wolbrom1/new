# Fifth Season motion kit

Loaders, logo animations, voice states and the small loading pieces every
surface uses, all built from the official Fifth Season artwork in
`public/brand/`.

## What the app already uses

These are wired in. Nothing to do unless you add a new surface.

| Need | Use | Wired into |
| --- | --- | --- |
| Inline spinner (12–20px) | `<MarkSpinner />` | submit button, console, document tool call and preview, version footer, sidebar history, attachment upload, image editor |
| "Working on it" | `<ThinkingIndicator label="…" />` | waiting for a reply, reasoning header |
| Placeholder blocks | `fs-skeleton` class | `ui/skeleton`, document and preview skeletons, artifact title, sidebar history |
| Route change | `chat/[id]/loading.tsx` | switching chats |
| Toast outcome | Success / Error Lottie | custom `toast()` and every Sonner toast via the root `<Toaster icons>` |
| First run | `Iris` opening, once | empty-chat greeting (`localStorage` key `fs-intro-seen`) |
| Voice | `useVoiceInput` + `<VoiceMark />` | mic button in the chat input |

## Adding it to a new surface

```tsx
import { MarkSpinner, ThinkingIndicator, ProgressBar, LottieState } from '@/components/fifthseason/states';

<MarkSpinner size={16} />                    // anywhere a spinner would go
<MarkSpinner size={14} tone="mono" />        // on a coloured button: draws in currentColor
<ThinkingIndicator label="Searching the web" />
<ProgressBar value={0.4} />                  // or no value for indeterminate
<LottieState name="success" loop={false} />  // one-shot, holds its last frame
<div className="fs-skeleton h-4 w-1/2 rounded-md" />  // replaces animate-pulse + bg
```

Rule of thumb: a spinner says *busy*, `ThinkingIndicator` says *the model is
working*, a skeleton says *content is on its way and will look like this*.

## Files

| Path | What |
| --- | --- |
| `brand.tsx` | The mark and wordmark as vector, the sampled brand gradients, `FifthSeasonMark`, `FifthSeasonLockup` |
| `states.tsx` | The platform kit above |
| `logo-loaders.tsx` | Eight loaders: Quadrant, Aurora, Converge, Tide, Prism, Flip, Tandem, Compass |
| `logo-openings.tsx` | Five one-shot logo openings: Assemble, Iris, Sweep, Unfold, Rise |
| `voice-mark.tsx`, `use-voice-input.ts` | Listening / thinking / speaking states, and mic dictation |
| `spinners.tsx`, `liquid.tsx` | Earlier exploratory sets, kept for reference |
| `public/brand/lottie/*.json` | Eight Lotties: three voice states, three loaders, success, error |
| `public/brand/gif/*.gif` | The same, light and dark backgrounds, for decks and docs |
| `public/brand/*.svg` | The official logo package, unchanged |

Keyframes live in `app/globals.css` under the "Fifth Season" headings. Every
animation respects `prefers-reduced-motion`.

## Configuration

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_FS_DICTATION=off` | Hides the mic button. Browsers transcribe speech with their own cloud service (Chrome: Google, Safari: Apple), so turn this off where audio must not leave the device. |

## Regenerating and checking

```sh
pnpm brand:lottie            # rebuild the Lotties from brand.tsx (e.g. if the gradient changes)

# Drive the real app through every waiting moment and screenshot it.
# The mock models stream canned replies, so no API key is needed.
service postgresql start
PLAYWRIGHT=True pnpm dev --port 3200
pnpm audit:surfaces http://localhost:3200 ./audit
```

The `/spinners`, `/spinners/liquid` and `/spinners/logo` routes are the
living style guide. The middleware matcher (`/spinners/:path*`) puts them
behind the app's login like every other page; delete the `app/spinners`
folder and that matcher entry if they should not ship.

## Browser support

`pnpm test:browsers <url> <outdir>` runs the same flow in all three engines
against a production build (see the script header for setup). Last run:

| Engine | Browsers | Result |
| --- | --- | --- |
| Chromium | Chrome, Edge, Perplexity Comet, Arc, Brave, Opera, ChatGPT Atlas | All checks pass, including dictation |
| WebKit 18.4 | Safari on macOS, and on iPhone (and every iOS browser, which must use WebKit) | All checks pass |
| Gecko 135 | Firefox | All checks pass; mic hidden (no speech recognition in Firefox) |

Checked in each: toast animation, first-visit opening, thinking indicator and
its gradient text, spinner animation, stop button while streaming, mic shown
only where speech recognition exists, route loading bar, and every loader,
Lottie and opening on the style guide.

Dictation was exercised with a scripted recogniser (headless engines have no
speech service); the mic level, animation and transcript handling are real.
Real speech recognition still needs one manual check in Chrome and Safari.

"Failed to fetch RSC payload… falling back to browser navigation" may appear
in the console when a page change cancels a background prefetch. That is
Next.js, logged on `main` too; navigation still completes.

## Known

- In test mode the "Creating document" row keeps spinning after the document
  finishes. The mock model repeats the tool call; confirm with a real model.
- The template's mobile sidebar drawer logs a `DialogContent requires a
  DialogTitle` accessibility warning on phones. Pre-existing; worth fixing.
- `next start` on localhost needs `AUTH_TRUST_HOST=true` (Auth.js production
  guard). Not needed behind a real domain.
