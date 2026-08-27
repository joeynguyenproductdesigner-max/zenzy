# Fix Log

Persistent memory of bugs found and fixed in this project. Check this before debugging; append after fixing.

---

## [2026-08-26] Audio silently didn't play — autoplay-gesture policy

- **Symptom:** Selecting a sound/music card showed the UI as selected (ring, slider) but no audio was ever audible, with no visible error initially.
- **Where:** `src/components/dialog/SoundDialog.tsx`, `useLoopingAudio` hook.
- **Root cause:** `audio.play()` was called from inside a `useEffect` that watched the selected `url` state. That effect runs a tick *after* the click that changed the state, so by the time `play()` fires it's no longer synchronously inside the user gesture. Safari (and some Chrome configs) silently refuse `play()` once it's detached from the triggering gesture — no error surfaces in that case, just silence.
- **Fix:** Reworked the hook to expose imperative `play(url)` / `stop()` functions called directly from the click/shuffle handlers instead of from an effect, so `play()` always executes inside the same call stack as the user's click.
- **Gotcha:** If audio (or any `.play()`/other gesture-gated API) is ever wired through a `useEffect` again, check whether the effect fires synchronously with the triggering event — if not, this bug resurfaces. Always call `.play()` directly in the event handler.

## [2026-08-26] Selection ring clipped on top/left edge inside scrollable containers

- **Symptom:** The purple `ring-2` selected-state outline was visibly cut off on the top and left edges for items in the first row/column of a scrollable grid or list (Themes grid, Music list).
- **Where:** `src/components/dialog/ThemeDialog.tsx`, `src/components/dialog/SoundDialog.tsx` (Music list container).
- **Root cause:** Per the CSS spec, setting `overflow-y: auto` on an element with `overflow-x` left at its default forces `overflow-x` to compute to `auto` as well (not `visible`) — so the container clips *any* overflow, including a child's `box-shadow`-based ring bleeding past its own edge, whenever that ring sits flush against the container's own edge with no padding.
- **Fix:** Add `p-1` (or similar) padding to the scrollable container so there's room for the ring to render before the container's clipping edge.
- **Gotcha:** Any new `overflow-y-auto`/`overflow-scroll` container that holds elements with a `ring-*` or `shadow-*` selected state needs this same padding, or the first row/column's ring will clip.

## [2026-08-26] Sounds card: long two-line labels silently lost their second line

- **Symptom:** Multi-word sound names ("City Hall Ambience", "Old Train Interior", "Library Ambience", "Street Ambience") rendered showing only the first word/line — the rest of the label just vanished, no ellipsis, no visible truncation indicator.
- **Where:** `src/components/dialog/SoundDialog.tsx`, Sounds grid card.
- **Root cause:** The label `<span>` used `line-clamp-2` (which sets `overflow: hidden` on it), sitting inside a flex column with a **fixed height** (`h-[56px]`) alongside an emoji span. Per the flex sizing spec, an item's automatic minimum size is `0` once its own `overflow` is not `visible` — so with the parent's fixed height too small to fit emoji + 2 lines of text at natural size, the flex-shrink algorithm shrank the label (which was allowed to go to 0) far more than the emoji (which wasn't), collapsing the two-line box down to roughly one line's worth of height and dropping the rest.
- **Fix:** Shrunk the emoji to a fixed small `leading-none` box and gave both the emoji and label spans `shrink-0`, plus tightened gaps/line-height, so the natural combined height fits within 56px without needing the flex algorithm to shrink anything.
- **Gotcha:** Any time a flex child uses `line-clamp-N` (or otherwise sets its own `overflow: hidden`) inside a **fixed-height** flex container that's tight on space, add `shrink-0` to it (or its siblings) — otherwise it silently absorbs the space deficit and clips more than the line count implies, with no visual overflow warning.

## [2026-08-26] Cloudinary media (`res.cloudinary.com`) — `ERR_TIMED_OUT`, not a code bug

- **Symptom:** Both images and audio from Cloudinary intermittently fail to load with `net::ERR_TIMED_OUT`. Confirmed even a direct browser navigation straight to a `res.cloudinary.com` URL (no app code involved at all) times out with "took too long to respond."
- **Where:** N/A — not app code. Confirmed reproducible from this Claude Code sandbox (`curl` and in-sandbox browser both time out reaching `res.cloudinary.com`), and was also seen once from the user's own network before they fixed it on their end (switching network/disabling VPN was the suggested next step, not yet confirmed which it was).
- **Root cause:** Network-level unreachability to `res.cloudinary.com` from the specific network in use at the time (this sandbox has no outbound internet at all; the user's report was likely a local network/ISP/VPN routing issue, not a Cloudinary outage or a code defect).
- **Fix:** None needed in code. If this resurfaces, first rule out environment/network (try a different network, disable VPN, check if it's the whole domain or one asset) before touching `media-config.ts` or the components that consume it.
- **Gotcha:** Don't waste time "fixing" this in code — verify network reachability to the domain first (`curl -sv https://res.cloudinary.com/...` or a direct browser navigation to the raw asset URL, bypassing the app).
