# Tasbih, Hisn Al-Muslim, Settings and Paywall

Reference for the worship screens (the tasbih counter, its audio player, the Hisn Al-Muslim adhkar reader and the adhkar dataset), the Settings screen and the premium paywall. State of the code at commit `68e723a` (`main`, 2026-11-16).

Conventions on this page:

- Line references are `path:line`. Inside a file's own section a bare `:123` means line 123 of that section's file.
- Arabic UI strings are quoted verbatim in "double quotes". `{name}` inside a quoted string marks a value interpolated at run time.
- *(runtime-checked)* marks behaviour that was also observed in headless Chrome against a production build of this commit (390×844 viewport unless another size is given). Everything else is read from the source.
- Audio URL availability was probed with HTTP `HEAD` requests on 2026-11-17; results can change without a code change.

| File | Lines | Role |
|---|---|---|
| `src/components/screens/TasbihModal.tsx` | 315 | Tasbih counter. Rendered inline as the whole "tasbih" tab, where it also hosts a two-way switch between the counter and Hisn Al-Muslim |
| `src/components/screens/TasbihAudioPlayer.tsx` | 770 | Audio card inside the counter: streams one Quran ayah per dhikr from a chosen reciter, with volume, loop, an optional synthesised ambient pad and a chime + speech-synthesis fallback |
| `src/components/screens/HisnScreen.tsx` | 1021 | Hisn Al-Muslim reader: daily tip, per-day repetition counters, time-based "wird" progress, search, pinned favourites and a category drawer |
| `src/data/hisnAlMuslim.ts` | 358 | Static dataset: 6 categories, 23 adhkar, 7 daily tips, and the tip-of-the-day selector |
| `src/components/screens/SettingsScreen.tsx` | 790 | Settings tab: theme, night-reading and high-contrast modes, font family and size, reminder preference, backup export/import, info links, share, and an always-visible developer block |
| `src/components/screens/PremiumPaywallScreen.tsx` | 301 | Paywall dialog for the premium "رحلتي" journey. No payment integration; the purchase buttons only show a notice and a developer unlock |

How the pieces nest: `App` renders `TasbihModal` (inline) for the `tasbih` tab (`src/App.tsx:183`); `TasbihModal` renders `TasbihAudioPlayer` in the counter view (`src/components/screens/TasbihModal.tsx:94`) and `HisnScreen` in the Hisn view (`src/components/screens/TasbihModal.tsx:289`); `HisnScreen` reads `src/data/hisnAlMuslim.ts`. `App` renders `SettingsScreen` for the `settings` tab (`src/App.tsx:195`). `PremiumPaywallScreen` is rendered from `App`, from `SettingsScreen` and from `JourneyPathScreen`.

Storage keys read or written by the files on this page (none of the first seven is included in the backup export, `src/lib/store.tsx:584`):

| Key | Value format | Owner |
|---|---|---|
| `alhamd_tasbih_count` | Decimal integer string. Lifetime tap total | Store (`src/lib/store.tsx:214`, `src/lib/store.tsx:564`); shown by `TasbihModal` |
| `alhamd_tasbih_reciter_v1` | Reciter id, e.g. `husary` | `TasbihAudioPlayer` (`src/components/screens/TasbihAudioPlayer.tsx:150`) |
| `alhamd_tasbih_volume_v1` | Float string between 0 and 1, e.g. `0.83` | `TasbihAudioPlayer` (`src/components/screens/TasbihAudioPlayer.tsx:151`) |
| `alhamd_hisn_counts_YYYY-MM-DD` | JSON object `{ [dhikrId]: number }`. One key per **UTC** date | `HisnScreen` (`src/components/screens/HisnScreen.tsx:126`) |
| `alhamd_hisn_favorites` | JSON array of dhikr ids | `HisnScreen` (`src/components/screens/HisnScreen.tsx:143`) |
| `alhamd:dev_premium` | `'true'` or `'false'` | `src/lib/entitlements.ts:1`; toggled from `SettingsScreen` and `PremiumPaywallScreen` |
| `alhamd:analytics_events_log` | JSON array, last 50 `{ event, metadata, timestamp }` | `src/lib/analytics.ts:2`; appended by the paywall's two events when consent is `'true'` |
| `alhamd_theme_v2`, `alhamd_high_contrast`, `alhamd_night_reading`, `alhamd_font_family`, `alhamd_font_size_v2`, `alhamd_text_size`, `alhamd_notif_enabled`, `alhamd_notif_time`, `alhamd:tourComplete` | See the state reference | Store, driven by `SettingsScreen` |
| `alhamd:journey_state:v1`, `alhamd:journey_onboarded:v1` | Journey state / onboarding flag | `src/lib/journeyStore.ts:52`; reset by the Settings developer tools |

Network: the only requests made by these files are audio downloads from `everyayah.com` and `cdn.islamic.network`, and only after the user presses play in the audio card.

---

## `src/components/screens/TasbihModal.tsx`

### Purpose

A digital tasbih (dhikr counter): seven preset dhikr chips, the audio card, a large tap button with a ring that fills every 100 taps, a session counter, the lifetime total, and a "virtue" card. In inline mode it is the entire tasbih tab and adds a header plus a switch between the counter ("عداد التسبيح") and Hisn Al-Muslim ("حصن المسلم").

### Mounted from

- `src/App.tsx:183-193`: inline, when `activeTab === 'tasbih'`. Passes `inline={true}`, `tasbihCount`, `onIncrementTasbih={incrementTasbih}`, `onResetTasbih={resetTasbih}`, `triggerHaptic`, `initialSubView={tasbihSubView}`, `initialHisnCategory={hisnCategory}`.
- `src/App.tsx:231-239`: modal mode, guarded by `isTasbihOpen`. That flag starts `false` (`src/App.tsx:60`) and the only setter call is `setIsTasbihOpen(false)` (`src/App.tsx:233`), so this mount is unreachable.

In the running app `initialSubView` is always `'counter'` and `initialHisnCategory` is always `undefined`: `App` sets them to other values only inside the `onOpenHisn` callback it hands to `HomeScreen` (`src/App.tsx:150-154`), and `HomeScreen` declares `onOpenTasbih` / `onOpenHisn` in its props type (`src/components/screens/HomeScreen.tsx:16-17`) but never destructures or calls them (`src/components/screens/HomeScreen.tsx:20-25`). The Hisn view is therefore reachable only through the switch inside this component.

### Exports

- `TasbihSubView` — `'counter' | 'hisn'` (`:11`).
- `TasbihModal` — `React.FC<TasbihModalProps>` (`:34`).

`TasbihModalProps` (`:13`) and `DHIKR_PRESETS` (`:24`) are not exported.

### Props

| Name | Type | Required | What it does |
|---|---|---|---|
| `onClose` | `() => void` | no | Close button handler in modal mode only (`:215`). Not rendered in inline mode |
| `tasbihCount` | `number` | yes | Lifetime total shown under "إجمالي الذكر" (`:174`) |
| `onIncrementTasbih` | `() => void` | yes | Called once per tap (`:65`); in `App` this is the store's `incrementTasbih` |
| `onResetTasbih` | `() => void` | yes | **Unused.** Declared (`:17`) and destructured (`:38`) but never called. Nothing in the UI resets the lifetime total |
| `triggerHaptic` | `(type?: 'light' \| 'medium' \| 'heavy' \| 'success') => void` | yes | Haptics; also forwarded to `TasbihAudioPlayer` (`:97`) and `HisnScreen` (`:291`) |
| `inline` | `boolean` | no, default `false` | `true`: page layout, large header, sub-view switch. `false`: centred modal card with close button, counter only |
| `initialSubView` | `TasbihSubView` | no, default `'counter'` | Initial sub-view; re-applied by an effect when it changes (`:48`) |
| `initialHisnCategory` | `HisnCategoryId` | no | Forwarded to `HisnScreen` as `initialCategory` (`:292`); also a dependency of the sub-view effect |

### Store / persistence

The component does not call `useStore()`. `App` passes store values in: `tasbihCount`, `incrementTasbih`, `resetTasbih`, `triggerHaptic` (`src/App.tsx:186-189`). `incrementTasbih` writes `alhamd_tasbih_count` on every tap (`src/lib/store.tsx:564-575`). The session counter is component state and is not persisted. No window events.

### Local state, refs, memos

| State | Initial | Drives |
|---|---|---|
| `sessionCount` (`:44`) | `0` | Number in the tap button, the progress ring, "في هذه الجلسة" |
| `selectedDhikr` (`:45`) | `DHIKR_PRESETS[0]` | Highlighted chip, the heading above the tap button, and the audio card's track (through its `selectedDhikr` prop) |
| `subView` (`:46`) | `initialSubView` | Which sub-view renders in inline mode |

`todayDhikr` is the constant `dailyDhikrs[0]` (`:53`, data in `src/data/dhikr.ts:7`), not a date-based pick. No refs or memos.

### Effects, timers, browser APIs

- One effect (`:48-50`): `setSubView(initialSubView)` whenever `initialSubView` or `initialHisnCategory` changes.
- No timers. No direct browser APIs; vibration goes through `triggerHaptic` (`navigator.vibrate`, `src/lib/store.tsx:257-266`).
- No external URLs in this file.

### UI structure and behaviour

Inline root (`:299-305`): `div` with page padding and `max-w-lg md:max-w-2xl lg:max-w-3xl`, `dir="rtl"`. Modal root (`:307-313`): full-screen dark backdrop with a `max-w-md` card, `max-h-[92vh] overflow-y-auto`.

1. **Header** (`:202-239`).
   - Inline: `h1` "المسبحة وحصن المسلم" and the line "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ".
   - Modal: round close button (`aria-label` "إغلاق") and `h2` "المسبحة".
   - While `subView === 'counter'`: a reset button (`title` and `aria-label` "تصفير الجلسة"); inline mode also shows the text "تصفير الجلسة". It sets `sessionCount` to 0 and fires a `medium` haptic (`:68-71`). The lifetime total is unaffected.
2. **Sub-view switch**, inline only (`:242-282`): two buttons, "عداد التسبيح" (with `TasbihIcon` from `src/components/layout/BottomTabBar.tsx:7`) and "حصن المسلم" (shield icon). Each fires a `light` haptic and sets `subView`.
3. **Sub-view** (`:285-295`): the counter when not inline or when `subView === 'counter'`; otherwise `<HisnScreen embedded triggerHaptic initialCategory />`. Modal mode can never show Hisn.

Counter section (`:73-197`), top to bottom:

1. **Dhikr chips** (`:76-90`): horizontally scrolling row of the seven `DHIKR_PRESETS`. Tapping sets `selectedDhikr`. It does not reset any counter; counts are not tracked per dhikr.
2. **Audio card** (`:93-99`): `<TasbihAudioPlayer selectedDhikr onSelectDhikr={setSelectedDhikr} triggerHaptic />`.
3. **Selected dhikr heading** (`:102-106`).
4. **Tap button** (`:109-162`), `id="btn-tasbih-tap"`, `aria-label` "اضغط للتسبيح", 192 px (224 px from `sm`). Contains an SVG ring (`r=92` in a 200×200 viewBox), the session count in Arabic-Indic digits, and the caption "اضغط للذكر". The ring arc is drawn only when `sessionCount > 0`; its fill is `(sessionCount % 100 || 100) / 100`, so it is full at 100, 200, … and restarts at 101 (`:140-143`).
5. **Counters row** (`:166-176`): "في هذه الجلسة" (session) and "إجمالي الذكر" (lifetime total from the store).
6. **Virtue card** (`:179-194`): heading "فضل الذكر", then `todayDhikr.text` and `todayDhikr.virtue`. Always the first entry of `dailyDhikrs`.

Tap flow (`:55-66`): `setSessionCount` with an updater that also calls `triggerHaptic` (`heavy` on every 100th session tap, otherwise `light`), then `onIncrementTasbih()`. The store's `incrementTasbih` fires its own haptic (`heavy` on every 33rd lifetime tap, otherwise `light`, `src/lib/store.tsx:568-572`). One tap therefore produces two `navigator.vibrate` calls *(runtime-checked)*.

Lifetime of state *(runtime-checked)*: `App` unmounts this component when another tab is selected, so the session count returns to 0 on every visit; the lifetime total persists. Switching to the Hisn sub-view keeps `sessionCount` but unmounts the audio card, which stops playback.

### Helpers, sub-components, constants

`DHIKR_PRESETS` (`:24-32`), in order:

1. "الْحَمْدُ لِلَّهِ"
2. "سُبْحَانَ اللَّهِ"
3. "اللَّهُ أَكْبَرُ"
4. "لا إِلَهَ إِلا اللَّهُ"
5. "أَسْتَغْفِرُ اللَّهَ"
6. "لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ"
7. "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ"

These exact strings are also the join key to the audio tracks (`dhikrPreset` in `src/components/screens/TasbihAudioPlayer.tsx:78`).

### Styling

- CSS custom properties from `src/index.css:3-29`: `--bg-raised`, `--raised-shadow` (tap button), `--border-hairline`, `--accent-stroke` (ring), `--text-primary`, `--accent-text`, `--bg-sunken` (switch track).
- Utility classes: `animate-fade-in` (`src/index.css:271`), `no-scrollbar` (`src/index.css:252`), `font-serif` (`src/index.css:66`).
- Hard-coded colours: `#E4C368` (selected chip and switch), `#15152A`, `#1E1E38`, `#2E2E4A`, `#AEAECB`, `#EDEDF5`, `#C8A951`. Light, high-contrast and night-reading themes recolour them through the `!important` remaps in `src/index.css:79-226`, `src/index.css:283-378` and `src/index.css:395-546`.
- Breakpoints: `sm` (640 px) enlarges text and the tap button; `md` / `lg` widen the container.
- Animation: `animate-fade-in` on the root, `active:scale-95` on the tap button, a 300 ms transition on the ring.

### Accessibility

- The tap button's `aria-label` replaces its text content, so the count is not exposed to assistive technology, and there is no live region for it.
- Close and reset buttons have `aria-label`s. Chips and the sub-view switch are plain buttons with no `aria-pressed`, `role="tab"` or `aria-selected`.
- Modal mode has no `role="dialog"`, `aria-modal`, focus trap or Escape handling (unreachable today).
- The ring is decorative SVG with no text alternative. No reduced-motion handling.
- With the Hisn view open the page has two `h1` elements (`:205` and `src/components/screens/HisnScreen.tsx:348`).

### Notes and quirks

- `onResetTasbih` is unused, so `resetTasbih` in the store has no caller that a user can reach.
- Modal mode, `onClose`, `initialSubView='hisn'` and `initialHisnCategory` are all unreachable with the current `App` and `HomeScreen`.
- Haptics are triggered inside a state updater function (`:56-64`), which React may invoke twice in development under `StrictMode` (`src/main.tsx:7`).
- The two haptic milestones differ (100 session taps here, 33 lifetime taps in the store) and both fire on the same tap.
- `src/lib/dailyLogic.ts:62` exports `getTodayDhikr(dayNumber)`, which would give a date-based dhikr; nothing imports it and this component uses index 0.

---

## `src/components/screens/TasbihAudioPlayer.tsx`

### Purpose

A collapsible audio card shown above the tap button. It plays one Quran ayah that relates to the selected dhikr, recited by one of five reciters, streamed from a third-party host with a second host as fallback. If both fail it plays a synthesised chime and speaks the dhikr phrase with the browser's speech synthesis. It also offers volume, mute, a "calm repeat" loop and an optional synthesised background drone.

### Mounted from

`src/components/screens/TasbihModal.tsx:94-98` only, with `selectedDhikr`, `onSelectDhikr={setSelectedDhikr}` and `triggerHaptic`.

### Exports

`ReciterOption` (`:19`), `DhikrAudioTrack` (`:27`), `RECITERS` (`:37`), `DHIKR_AUDIO_TRACKS` (`:75`), `TasbihAudioPlayer` (`:159`). Only `TasbihAudioPlayer` is imported elsewhere.

### Props

| Name | Type | Required | What it does |
|---|---|---|---|
| `selectedDhikr` | `string` | yes | The parent's selected preset. When it equals a track's `dhikrPreset`, that track becomes active (`:205-212`) |
| `onSelectDhikr` | `(dhikr: string) => void` | no | Called from the previous / next buttons so the parent's chip follows the track (`:546-548`). Not called for the eighth track ("آية الكرسي"), which has no chip |
| `triggerHaptic` | `(type?: 'light' \| 'medium' \| 'heavy' \| 'success') => void` | no | `light` haptic on play/pause, track step, reciter change, loop and ambient toggles |

All three props are used.

### Store / persistence

No `useStore()`. Direct `localStorage` access:

| Key | Format | Read | Written |
|---|---|---|---|
| `alhamd_tasbih_reciter_v1` (`:150`) | Reciter id | State initialiser, `:165`, not wrapped in `try`; unknown ids fall back to the first reciter at render time (`:197-198`) | `handleSelectReciter`, `:218`, in `try/catch` |
| `alhamd_tasbih_volume_v1` (`:151`) | `String(number)` in `[0, 1]` | State initialiser, `:169-176`; accepted only if it parses to a number in range, otherwise `0.8` | `handleVolumeChange`, `:233`, in `try/catch` |

Mute, loop, ambient pad, expanded/collapsed and the active track are not persisted. No window events.

### Local state, refs, memos

| State | Initial | Drives |
|---|---|---|
| `reciterId` (`:164`) | stored id or `RECITERS[0].id` | Active reciter chip, URLs |
| `volume` (`:168`) | stored value or `0.8` | Slider, `audio.volume`, chime / speech / pad loudness |
| `isMuted` (`:179`) | `false` | `effectiveVolume = isMuted ? 0 : volume` (`:202`) |
| `isPlaying` (`:180`) | `false` | Play/pause icon, "يُتلى الآن" badge, card border, the load-and-play effect |
| `isLoading` (`:181`) | `false` | Spinner inside the play button |
| `isLooping` (`:182`) | `true` | What happens when the clip ends |
| `ambientPadEnabled` (`:183`) | `false` | Web Audio drone |
| `isExpanded` (`:184`) | `true` | Visibility of the reciter / volume / toggle panel |
| `activeTrackIndex` (`:185`) | `0` | `currentTrack` |
| `progressPercent` (`:186`) | `0` | Progress line |

| Ref | Holds |
|---|---|
| `audioRef` (`:188`) | The single `HTMLAudioElement`, created lazily with `new Audio()` (`:421`) and never attached to the DOM |
| `loopTimeoutRef` (`:189`) | Id of the pending loop / stop timer |
| `fallbackSourceAttemptedRef` (`:190`) | Whether the second host has been tried for the current play attempt |
| `audioCtxRef` (`:193`) | Shared `AudioContext` for the chime and the ambient pad |
| `ambientGainRef` (`:194`), `ambientOscsRef` (`:195`) | Master gain and the two oscillators of the pad |

`getPrimaryUrl`, `getFallbackUrl` and `playOfflineFallback` are `useCallback`s (`:240`, `:247`, `:255`); the last depends on `effectiveVolume` and `isLooping`.

### Effects, timers, browser APIs

External URLs (the only ones on this page):

- Primary (`:242`): `https://everyayah.com/data/{everyAyahFolder}/{surahAyahCode}.mp3`
- Fallback (`:249`): `https://cdn.islamic.network/quran/audio/128/{islamicNetworkEdition}/{globalAyahNumber}.mp3`

`HEAD` probe on 2026-11-17 of all 5 reciters × 8 tracks: all 40 primary URLs returned 200. Of the 40 fallback URLs, 32 returned 200 and the 8 for `ar.abdulbasitmurattal` returned 403; the same path under `/192/` instead of `/128/` returned 200.

Effects, in declaration order:

| # | Lines | Dependencies | What it does |
|---|---|---|---|
| 1 | `:205-212` | `[selectedDhikr]` | Finds the track whose `dhikrPreset` equals `selectedDhikr` and activates it. `activeTrackIndex` is read but not listed as a dependency |
| 2 | `:312-374` | `[ambientPadEnabled, isPlaying, effectiveVolume]` | Ambient pad. Off, paused or volume 0: fades the pad gain to 0.0001. Otherwise creates (once) a gain node → low-pass filter at 340 Hz → destination, starts two sine oscillators at 144 Hz and 216 Hz, and sets the gain target to `effectiveVolume * 0.045` |
| 3 | `:377-404` | `[]` | Unmount cleanup: clears the timer, pauses the audio and empties its `src`, stops the oscillators, closes the `AudioContext`. It does not cancel speech synthesis |
| 4 | `:407-411` | `[effectiveVolume]` | Copies the volume to the audio element |
| 5 | `:414-471` | `[isPlaying, activeTrackIndex, reciterId, currentTrack, currentReciter, getPrimaryUrl, getFallbackUrl, playOfflineFallback]` | Load and play (see flow below) |
| 6 | `:474-530` | `[isLooping, isPlaying, currentTrack, currentReciter, getFallbackUrl, playOfflineFallback]` | Adds and removes `timeupdate`, `ended` and `error` listeners on the audio element |

Timers:

- 2200 ms after a clip ends while looping, then seek to 0 and play again (`:490-497`).
- 1800 ms after the fallback utterance ends while looping, then `setIsPlaying(false)` (`:292-294`).
- Both ids go into `loopTimeoutRef`; cleared at the start of effect 5 (`:415-418`) and on unmount (`:379-381`).

Browser APIs: `Audio` / `HTMLMediaElement` (`preload = 'auto'`, `:422`); `AudioContext` or `webkitAudioContext` with `OscillatorNode`, `GainNode`, `BiquadFilterNode` (`:258-281`, `:326-362`); `window.speechSynthesis` and `SpeechSynthesisUtterance` (`:283-299`); `localStorage`.

Playback flow:

1. The play button calls `togglePlay` (`:532-535`): `light` haptic, flip `isPlaying`.
2. Effect 5 runs. If `isPlaying` is false it pauses and clears `isLoading`. Otherwise it resets `fallbackSourceAttemptedRef`, sets `audio.src` to the primary URL if different (resetting progress), sets `isLoading`, and calls `audio.play()`.
3. If that promise resolves, `isLoading` clears. If it rejects and the fallback host has not been tried, the flag is set, `audio.src` becomes the fallback URL and `play()` is called again; if that rejects too, or the flag was already set, `playOfflineFallback(currentTrack)` runs (`:448-460`).
4. Independently, the `error` listener (`:503-512`) applies the same rule using the same flag.
5. `timeupdate` updates `progressPercent` (`:478-484`).
6. `ended` (`:486-501`): progress 100; if looping, wait 2200 ms, seek to 0, play (a rejection stops playback); otherwise `setIsPlaying(false)`.

Speech-synthesis fallback, `playOfflineFallback` (`:255-309`):

1. Chime: a 432 Hz sine oscillator through a gain node that ramps from 0.001 to `max(0.02, effectiveVolume * 0.18)` in 0.25 s and down to 0.0001 at 2.4 s; the oscillator stops at 2.5 s (`:266-280`). The floor of 0.02 applies even when muted.
2. If `speechSynthesis` exists and `effectiveVolume > 0`: `speechSynthesis.cancel()`, then speak `track.dhikrPreset` (the dhikr phrase, or "آية الكرسي" for the eighth track, not the ayah) with `lang = 'ar-SA'`, `rate = 0.82`, `volume = effectiveVolume` (`:283-299`). No voice is selected explicitly and there is no `onerror` handler.
3. `utter.onend` clears `isLoading`; with looping on it waits 1800 ms and then sets `isPlaying` to false; with looping off it sets it to false at once. The phrase is not repeated in either case *(runtime-checked)*.
4. Without speech synthesis, with volume 0, or on any exception: `isLoading` and `isPlaying` become false (`:305-306`).

Observed with the network intercepted *(runtime-checked)*:

- Primary host failing, fallback host working: the fallback stream starts **and** the chime and utterance start about 45 ms later, because both the rejected `play()` promise and the `error` listener handle the same failure. The spinner stays visible while the fallback stream plays.
- Both hosts failing: `playOfflineFallback` ran three times for one press of play (three oscillators, three `speak` calls within about 2 ms).
- Pressing pause while the utterance is pending does not call `speechSynthesis.cancel()`.
- Moving the volume slider or toggling loop while playing re-runs effect 5 (through the changed `playOfflineFallback` identity) and calls `audio.play()` again each time; the playback position was not reset.

### UI structure and behaviour

Root (`:555-562`): rounded card on `--bg-raised`; the border turns gold (`rgba(228, 195, 104, 0.45)`) while playing.

1. **Top row** (`:564-632`).
   - Play / pause button, `aria-label` "تشغيل تلاوة الذكر الهادئة" when stopped and "إيقاف مؤقت لتلاوة الذكر" when playing. Shows a spinner while `isLoading`.
   - Title "تلاوة الأذكار الهادئة" with a headphones icon; badge "يُتلى الآن" while playing; subtitle `بصوت القارئ {reciter name} · {track title}`.
   - Previous-track button (`title` and `aria-label` "المقطع السابق", drawn with the `SkipForward` icon) and next-track button ("المقطع التالي", `SkipBack` icon); the icons are swapped for the right-to-left layout. They step through the eight tracks with wrap-around (`:537-549`).
   - Expand / collapse button, `aria-label` "طي إعدادات الصوت والقارئ" or "فتح إعدادات الصوت والقارئ".
2. **Verse box** (`:635-657`): `verseText`, then `surahRef` and the `dhikrPreset`, then a progress line whose width is `max(6, progressPercent)` % while playing and 0 otherwise.
3. **Expanded panel** (`:660-767`), shown while `isExpanded`:
   - "اختيار القارئ:" with the active reciter's `styleLabel`, and a scrolling row of five reciter chips. Selecting one saves the id and, if playing, restarts playback from the new reciter's URL *(runtime-checked)*.
   - Volume row: mute button (`aria-label` "كتم الصوت" / "إلغاء كتم الصوت"; icon reflects level), a range input 0–100 (`aria-label` "مستوى الصوت"), and the percentage in Arabic-Indic digits. Moving the slider above 0 while muted un-mutes (`:229-231`).
   - "تكرار هادئ" toggle (`title` "تكرار تلقائي هادئ للذكر"), on by default.
   - "أثير السكينة" toggle (`title` "إضافة خلفية صوتية هادئة أثناء التلاوة"), off by default.

### Helpers, sub-components, constants

`RECITERS` (`:37-73`). The first entry is the default:

@@RECITERS@@

`DHIKR_AUDIO_TRACKS` (`:75-148`). Tracks 0–6 map one-to-one, in order, to `DHIKR_PRESETS` in `TasbihModal`; track 7 has no chip:

@@TRACKS@@

`surahAyahCode` is the three-digit surah followed by the three-digit ayah. `globalAyahNumber` is the ayah's 1-based position in the whole Quran. The two columns agree for all eight tracks (checked arithmetically against surah lengths).

Other constants: `STORAGE_RECITER_KEY`, `STORAGE_VOLUME_KEY` (`:150-151`); `VolumeIcon` picks `VolumeX` at 0, `Volume1` below 0.5, else `Volume2` (`:551-552`).

### Styling

- CSS custom properties: `--bg-raised`, `--border-hairline`, `--bg-sunken`.
- Hard-coded colours: gold `#E4C368`, violet `#6C63FF` / `#594DFF`, `#15152A`, `#252547` (hover only, not remapped in other themes), `#2E2E4A`, `#1E1E38`, `#AEAECB`, `#EDEDF5`; the playing-state border is an inline `rgba(228, 195, 104, 0.45)` that no theme remaps.
- The progress line is a right-to-left gradient from `#E4C368` to `#6C63FF`.
- `no-scrollbar` on the reciter row; Tailwind `animate-spin` for the spinner; `accent-[#E4C368]` on the range input.
- Breakpoint: at `sm` the volume row and the two toggles sit on one line.

### Accessibility

- Icon-only buttons have `aria-label`s. The loop and ambient toggles have visible text and a `title` but no `aria-pressed`; reciter chips have no selected state; the expand button has no `aria-expanded`.
- The progress line and the "يُتلى الآن" badge are not announced (no `role="progressbar"`, no live region).
- The spinner has no text alternative.
- Buttons are native and keyboard-operable. Small targets: 32 px step and expand buttons.
- No reduced-motion handling.

### Notes and quirks

- The card is titled as dhikr recitation, but the audio is a Quran ayah related to the dhikr. The caption for the third track is an elided ayah ("...") and the caption for the eighth is the opening part of the ayah only.
- The fallback URL hard-codes the 128 kbps path, which the fallback host does not serve for `ar.abdulbasitmurattal`.
- When the eighth track is active the parent's `selectedDhikr` keeps its previous value (`:546`). Tapping that same chip again does not change `selectedDhikr`, so effect 1 does not run and the track stays on the eighth. (Read from the code; not exercised at run time.)
- The ambient oscillators keep running at near-zero gain after the toggle is switched off, until unmount.
- `audioCtxRef.current.close()` returns a promise; a rejection would not be caught by the surrounding `try` (`:397-401`).
- Reads from `localStorage` in the state initialisers are not wrapped in `try/catch` (`:165`, `:169`), unlike the writes.

---

## `src/components/screens/HisnScreen.tsx`

### Purpose

Reader for a selection of daily adhkar from Hisn Al-Muslim. Shows a tip of the day, three time-based "wird" progress cards, a search box, category pills, and one card per dhikr with a tap-to-count button. Counts are stored per day; pinned favourites are stored permanently.

### Mounted from

`src/components/screens/TasbihModal.tsx:289-293` only: `<HisnScreen embedded={true} triggerHaptic={triggerHaptic} initialCategory={initialHisnCategory} />`.

### Exports

- `HisnCategoryIcon` (`:71`) — maps a category id to a lucide icon: `morning` → `Sun`, `evening` → `Moon`, `prayer` → `Compass`, `sleep` → `Sparkles`, `home` → `Home`, `dua` and anything else → `HeartHandshake`. Used only inside this file.
- `HisnScreen` (`:93`).

`HisnScreenProps` (`:29`) and `getRecommendedCategoryForCurrentTime` (`:37`) are not exported.

### Props

| Name | Type | Required | What it does |
|---|---|---|---|
| `triggerHaptic` | `(type?: 'light' \| 'medium' \| 'heavy' \| 'success') => void` | yes | Haptic on almost every interaction |
| `initialCategory` | `HisnCategoryId` | no | Initial category (`:102-104`); an effect re-applies it and leaves favourites mode when it changes (`:118-123`). Always `undefined` in the running app (see `TasbihModal`) |
| `externalDrawerOpen` | `boolean` | no, default `false` | Opens the drawer when it becomes true (`:112-116`). **Never passed by any caller** |
| `onCloseExternalDrawer` | `() => void` | no | Called when the drawer closes (`:166`). **Never passed by any caller** |
| `embedded` | `boolean` | no, default `false` | `true` drops the page padding and max-width (`:337-339`). The only caller passes `true`, so the non-embedded branch is unused |

### Store / persistence

No `useStore()`. Direct `localStorage`:

| Key | Format | Read | Written |
|---|---|---|---|
| `alhamd_hisn_counts_{YYYY-MM-DD}` | JSON object, dhikr id → repetitions done today | State initialiser, `:131-138`; `{}` on a missing key or a parse error | Effect on every `counts` change, including once on mount (`:152-156`); an empty `{}` is written just by opening the screen *(runtime-checked)* |
| `alhamd_hisn_favorites` | JSON array of dhikr ids | State initialiser, `:141-150` | Effect on every change, including once on mount (`:158-162`) |

- The date in the first key is `new Date().toISOString().split('T')[0]` (`:127`), which is the **UTC** date, and it is memoised for the lifetime of the component (`:126-129`). At 01:30 on 18 November in Riyadh the key was `alhamd_hisn_counts_2026-11-17` *(runtime-checked)*.
- Keys for earlier days are never read again and never deleted.
- Default favourites when the key is missing or unparsable: `morning-ayat-kursi`, `morning-sayyid-istighfar`, `evening-afiyah` (`:146`, `:148`).
- Parsed values are used without checking their shape.
- No window events.

### Local state, refs, memos

| State | Initial | Drives |
|---|---|---|
| `selectedCategory` (`:102`) | `initialCategory` or the time-based recommendation | Which category's adhkar are listed |
| `showFavoritesOnly` (`:105`) | `false` | Favourites mode |
| `searchQuery` (`:106`) | `''` | Search filter; also hides the pills and the category header |
| `isSideMenuOpen` (`:107`) | `false` | Drawer |
| `copiedId` (`:108`) | `null` | Check-mark on the copy button of one card for 2 s |
| `copiedDailyTip` (`:109`) | `false` | Check-mark on the tip's copy button for 2 s |
| `counts` (`:131`) | from storage | Per-dhikr repetitions |
| `favoriteIds` (`:141`) | from storage | Pinned adhkar |

| Memo | Lines | Value |
|---|---|---|
| `recommended` | `:100` | Result of `getRecommendedCategoryForCurrentTime()`, computed once per mount |
| `dailyTip` | `:101` | `getDailyHisnTip().tip`, computed once per mount |
| `todayKey` | `:126-129` | Storage key for today's counts |
| `categoryStats` | `:220-249` | Per category: `completed` (items whose count reached the target), `total`, `completedReps` (sum of `min(target, done)`), `totalReps`, `percentage = round(completed / total × 100)` |
| `dailyTimeWirds` | `:252-293` | The three wird cards (`morning`, `evening`, `prayer`) with their stats, items, and `isRecommendedNow` |
| `overallDailyWirdStats` | `:295-300` | Items completed across those three categories only, as a percentage |
| `displayedAdhkar` | `:303-319` | The filtered list |
| `activeCategoryMeta` | `:321-324` | The selected category's metadata |

No refs.

### Effects, timers, browser APIs

- Effect (`:112-116`): open the drawer when `externalDrawerOpen` becomes true.
- Effect (`:118-123`): when `initialCategory` is set or changes, select it and leave favourites mode.
- Effects (`:152-156`, `:158-162`): persist `counts` and `favoriteIds`; storage errors are swallowed.
- Timers: two `setTimeout`s of 2000 ms that clear the "copied" indicators (`:215`, `:398`); not cancelled on unmount.
- `navigator.clipboard.writeText` (`:212`, `:395`), failures swallowed.
- `new Date()` for the time-of-day recommendation (`:42`) and the storage key (`:127`).
- `motion` / `AnimatePresence` for the drawer (`:869-1018`).
- No network requests.

### UI structure and behaviour

Root (`:335-342`): `div dir="rtl"` with `animate-fade-in`. From top to bottom:

1. **Header** (`:344-371`): shield icon, `h1` "حصن المسلم", subtitle "أذكار اليوم والليلة المختارة لتحصين القلب ودوام الذكر.", and a button "فهرس الأذكار" (`title` and `aria-label` "فتح القائمة الجانبية للأذكار") that opens the drawer.
2. **Tip of the day** (`:374-431`): label "نصيحة اليوم في فضل الذكر والتدبر", the tip's `title` as `h2`, a copy button (`aria-label` "نسخ نصيحة اليوم"), the `content`, then the `evidence` and `source`.
3. **Wird card** (`:434-617`): `h2` "الأوراد اليومية حسب الوقت", subtitle "تتبّع تقدّمك اليومي في أذكار الصباح والمساء والصلاة", a badge "إنجاز اليوم: {n}٪", an overall progress bar, then three cards (one column, three from `sm`):

   | Category | Card title | Time range |
   |---|---|---|
   | `morning` | "أذكار الصباح" | "من الفجر إلى الضحى" |
   | `evening` | "أذكار المساء" | "من العصر إلى المساء" |
   | `prayer` | "أذكار الصلاة" | "دُبُر كل صلاة مكتوبة" |

   Each card (`:473-591`) shows the icon, title, time range, a badge "وقته الآن" when it is the recommended category and not complete, a 48 px ring with the percentage (or a check when complete), one segment per dhikr (gold when done, `--cta-bg` when partly done; the `title` attribute carries `{dhikr title}: {done}/{target}`), the line "{completed} من {total} أذكار", and either "مكتمل ✓" or "{done}/{total} تكرار". Tapping a card leaves favourites mode, clears the search and selects that category (`:475-480`).

   Below the cards: the hint "اختر الورد أعلاه لعرض أذكاره بالأسفل أو تصفّح أذكارك المثبّتة:" and a toggle "المثبّتة ({n})" for favourites mode (`:597-616`).
4. **Search box** (`:620-639`): placeholder "ابحث في أذكار حصن المسلم...", with a clear button (`aria-label` "مسح البحث") once text is entered.
5. **Category pills** (`:642-673`), hidden while a search is active: one per category showing its `badge`, with a check when every item is complete. Selecting one leaves favourites mode.
6. **Category header** (`:676-702`), hidden in favourites mode and during search: the category `title` and `subtitle`, a badge "{completed} / {total} مكتمل", and, only when at least one item is complete, a reset button (`title` and `aria-label` "إعادة ضبط عدادات هذا القسم").
7. **Adhkar list** (`:705-866`). Empty state: "لا توجد أذكار مطابقة" with either "اضغط على أيقونة الحفظ بجانب أي ذكر لإضافته إلى الوصول السريع." (favourites mode) or "جرّب البحث بكلمة أخرى أو اختر قسمًا من فهرس الأذكار.". Otherwise one `GlassCard` per item (`:726-862`):
   - Title chip; then icon buttons: reset this counter ("تصفير العداد", only when the count is above 0), pin / unpin ("تثبيت في الوصول السريع" / "إزالة من الوصول السريع"), copy ("نسخ الذكر").
   - The text in a sunken box. Quran items use `font-quran ayah-text`, the `--ayah-color`, and are wrapped in ﴿ ﴾; others use `font-serif`.
   - "الفضل: " followed by the `virtue`, when present.
   - The `source`, and the counter button: "تكرار:" with "{done} / {target}", or "تمّ ({target})" when complete. A translucent fill inside the button shows partial progress.
8. **Drawer** (`:869-1018`): see below.

Filtering rules (`:303-319`):

- Favourites mode: only pinned items, from all categories.
- No search and not favourites mode: only the selected category.
- With a search: any item whose `title`, `text` or `source` contains the trimmed query. The comparison is a plain substring test after `toLowerCase()`, with no Arabic normalisation. The `text` field is fully vocalised, so "الحمد" matched 1 item and "الْحَمْدُ" matched 9 *(runtime-checked)*. In favourites mode the search is limited to pinned items.

Counting flow (`:169-183`):

1. Tapping the counter button, or anywhere else on the card, calls `handleTapDhikr`. The icon buttons stop propagation.
2. If the count has reached the target: `light` haptic, nothing else. Counts never exceed the target.
3. Otherwise the count increases by one; `success` haptic when the target is reached, `light` otherwise.
4. The new `counts` object is written to today's key.

Other flows:

- Reset one counter (`:185-189`): sets it to 0, `light` haptic.
- Reset category (`:191-198`): deletes the counts of every item in the selected category, `medium` haptic, no confirmation.
- Pin / unpin (`:200-206`): toggles the id in `favoriteIds`, `light` haptic.
- Copy a dhikr (`:208-217`). Clipboard text:

  ```
  {title}
  ﴿{text}﴾        (Quran items)   or   «{text}»   (others)
  ({source})
  — حصن المسلم · تطبيق «الحمد»
  ```
- Copy the tip (`:392-399`). Clipboard text:

  ```
  نصيحة اليوم: {title}
  {content}
  {evidence} ({source})
  — حصن المسلم · تطبيق «الحمد»
  ```

Drawer (`:869-1018`): a backdrop and an `aside` that slides in from the right with a spring. Contents: heading "فهرس حصن المسلم" with a close button (`aria-label` "إغلاق القائمة الجانبية"); section "الوصول السريع" with one button "الأذكار المثبّتة" / "أذكارك المختارة للوصول الفوري" and the pinned count, which enters favourites mode; section "أبواب حصن المسلم اليومية" listing the six categories with title, subtitle and "{completed}/{total}"; footer "﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾". Choosing an entry clears the search and closes the drawer. The backdrop also closes it.

Drawer positioning *(runtime-checked)*: the drawer wrapper is `fixed inset-0` (`:871`), but the screen root has `animate-fade-in`, whose keyframes end on `transform: translateY(0)` with `animation-fill-mode: forwards` (`src/index.css:261-273`). A transformed ancestor becomes the containing block for fixed descendants, so the drawer is laid out against the Hisn content box instead of the viewport. Measured: backdrop 358×3428 px starting below the tab header, panel 320×3428 px; the app's top bar and the tasbih header stay undimmed, and the bottom tab bar paints over the drawer.

### Helpers, sub-components, constants

`getRecommendedCategoryForCurrentTime()` (`:37-69`) uses the local hour:

| Local hour | `categoryId` | `label` | `reason` |
|---|---|---|---|
| 04:00–11:59 | `morning` | "أذكار الصباح" | "وقتها المستحب الآن في الصباح" |
| 15:00–20:59 | `evening` | "أذكار المساء" | "وقتها المستحب الآن في المساء" |
| 21:00–03:59 | `sleep` | "أذكار النوم والاستيقاظ" | "ختام يومك بذكر الله قبل المنام" |
| 12:00–14:59 | `prayer` | "أذكار بعد الصلاة" | "أذكار دُبُر الصلوات المكتوبة" |

Only `categoryId` is used (`:103`, `:290`); `label` and `reason` are never rendered.

`HisnCategoryIcon` is described under Exports.

### Styling

- CSS custom properties: `--border-hairline`, `--accent-text`, `--accent-stroke`, `--bg-raised`, `--bg-sunken`, `--cta-bg`, `--text-primary`, `--text-secondary`, `--ayah-border`, `--ayah-color`; `GlassCard` adds `--bg-glass` and `--card-shadow` (`src/components/common/GlassCard.tsx:27-29`).
- Classes from `src/index.css`: `animate-fade-in`, `no-scrollbar`, `font-serif`, `font-quran` (`src/index.css:74`), `ayah-text` (recoloured in the light and night-reading themes, `src/index.css:162` and `src/index.css:534`).
- Hard-coded colours: gold `#E4C368` / `#C8A951`, violet `#6C63FF` / `#594DFF` (counter button, favourites toggle), `#15152A`, `#1E1E38`, `#25232E`, `#2E2E4A`, `#AEAECB`, `#C7C4D8`, `#EDEDF5`.
- Breakpoints: `sm` switches the wird cards to three columns and enlarges text; `md` / `lg` apply only in the unused non-embedded layout.
- Animation: `animate-fade-in` on the root; drawer backdrop fade 0.2 s; drawer panel spring (`damping: 28, stiffness: 280`); 300–500 ms transitions on bars and rings.

### Accessibility

- Icon-only buttons carry `aria-label`s.
- The three wird cards are `div`s with `onClick` (`:473-486`): no role, no `tabIndex`, no key handler, so they cannot be reached from the keyboard. The category pills and the drawer offer equivalent navigation.
- The dhikr cards are clickable `div`s too (via `GlassCard`), but the counter button inside each gives a keyboard path.
- The search input has only a placeholder, no label.
- Pills and the favourites toggle expose no selected / pressed state.
- Progress bars, rings and segments have no `role="progressbar"`; segments rely on `title`.
- The drawer has no `role="dialog"`, no focus move or trap, and no Escape handler.
- "Copied" feedback is an icon swap with no live region.
- No reduced-motion handling for the drawer spring or the fade-in.

### Notes and quirks

- The overall "إنجاز اليوم" figure covers only `morning`, `evening` and `prayer`. Completing items in the other three categories leaves it unchanged *(runtime-checked)*.
- The wird card for `prayer` is titled "أذكار الصلاة" while the category itself is titled "أذكار بعد الصلاة".
- "Daily" progress rolls over at UTC midnight (03:00 in UTC+3), and not at all while the component stays mounted.
- The category reset button appears only when an item is fully complete (`:689`); partly counted items alone do not show it.
- The pinned count shown in "المثبّتة ({n})" is `favoriteIds.length`, including ids that no longer exist in the dataset.
- The fallback objects with `total: 1` (`:276-282`, `:326-332`, `:952`) cannot be reached, because `categoryStats` has an entry for every category.
- `externalDrawerOpen`, `onCloseExternalDrawer`, the non-embedded layout, and the `label` / `reason` fields are unused.

---

## `src/data/hisnAlMuslim.ts`

### Purpose

Static, hand-written dataset for the Hisn screen: category metadata, 23 adhkar with repetition targets, seven tips, and a function that picks the tip for a date. No React, no storage, no network.

### Imported by

- `src/components/screens/HisnScreen.tsx:20-26` — `HISN_CATEGORIES`, `HISN_ADHAKR`, `HisnCategoryId`, `HisnDhikrItem`, `getDailyHisnTip`.
- `src/components/screens/TasbihModal.tsx:7`, `src/App.tsx:14`, `src/components/screens/HomeScreen.tsx:8` — the `HisnCategoryId` type only.

### Exports

| Export | Kind | Lines |
|---|---|---|
| `HisnCategoryId` | type | `:1-7` |
| `HisnCategory` | interface | `:9-14` |
| `HisnDhikrItem` | interface | `:16-25` |
| `HISN_CATEGORIES` | `HisnCategory[]` | `:27-64` |
| `HISN_ADHAKR` | `HisnDhikrItem[]` | `:66-288` |
| `HisnDailyTip` | interface | `:290-296` |
| `HISN_DAILY_TIPS` | `HisnDailyTip[]` | `:298-348` |
| `getDailyHisnTip` | function | `:350-357` |

`HisnCategory`, `HisnDailyTip` and `HISN_DAILY_TIPS` are not imported anywhere else.

### Types

```ts
type HisnCategoryId = 'morning' | 'evening' | 'prayer' | 'sleep' | 'home' | 'dua';

interface HisnCategory { id: HisnCategoryId; title: string; subtitle: string; badge: string; }

interface HisnDhikrItem {
  id: string;               // '<category>-<slug>'
  categoryId: HisnCategoryId;
  title: string;            // unvocalised label shown as a chip
  text: string;             // fully vocalised dhikr text
  isQuran?: boolean;        // switches font, colour and ﴿ ﴾ wrapping in the UI
  count: number;            // repetition target
  source: string;           // reference shown under the text
  virtue?: string;          // shown after "الفضل: "
}

interface HisnDailyTip { id: string; title: string; content: string; evidence: string; source: string; }
```

There is no review-status, grading or reference-number field, unlike the blessings data.

### Categories

The array order is the order of the pills and of the drawer list.

@@CATEGORIES@@

### Adhkar

23 items; 3 are marked `isQuran`; 16 have `count` 1, 6 have `count` 3, 1 has `count` 33; the targets sum to 67. Every item has a `virtue`. Ids are unique.

@@ADHKAR@@

Virtue texts:

@@VIRTUES@@

### Daily tips

@@TIPS@@

### `getDailyHisnTip(date = new Date())`

Returns `{ tip, index }` (`:350-357`). `dayOfYear = floor((date − local midnight of 31 December of the previous year) / 86 400 000)`, so 1 January is day 1; `index = |dayOfYear| mod 7`. The calculation uses local time. `HisnScreen` uses only `tip` and evaluates it once per mount.

### Notes and quirks

- The constant is spelled `HISN_ADHAKR`.
- `prayer-istighfar-salam` puts the repetition instruction "(ثَلَاثًا)" inside the text and has `count` 1; `prayer-tasbih-tahmid-takbir` is one combined phrase with `count` 33.
- `morning-niamah-shukr` and `evening-niamah-shukr` are the morning and evening forms of the same dhikr but carry different `source` strings ("رواه أبو داود والنسائي" and "رواه أبو داود").
- `source` describes the dhikr text; the `virtue` sentence has no reference of its own.
- In a non-leap year 31 December (day 365, index 1) and 1 January (day 1, index 1) show the same tip.
- Because the day number comes from a millisecond difference divided by 24 h, the first hour after midnight during daylight-saving time yields the previous day's index.

---

## `src/components/screens/SettingsScreen.tsx`

### Purpose

The Settings tab. It changes appearance (theme, night-reading mode, high contrast), display font and size, stores the reminder preference, exports and imports a JSON backup, opens the informational modals, replays the tour, shares the app, and contains a developer block that toggles the local premium flag and exposes journey test tools.

### Mounted from

`src/App.tsx:195-197`, when `activeTab === 'settings'`. The tab is reached from the gear button in `TopBar` (`src/App.tsx:131`) or the desktop navigation bar; the bottom tab bar has no Settings entry.

### Exports

`SettingsScreen` — `React.FC` (`:74`). `DISPLAY_FONT_OPTIONS` (`:37`) is not exported.

### Props

None.

### Store / persistence

From `useStore()` (`:75-94`):

| Used | Kind | Purpose here |
|---|---|---|
| `theme`, `setTheme` | state, action | Dark / light buttons |
| `highContrast`, `setHighContrast` | state, action | High-contrast switch |
| `nightReadingMode`, `setNightReadingMode` | state, action | Night-reading switch |
| `fontFamily`, `setFontFamily` | state, action | Font cards |
| `fontSize`, `setFontSize` | state, action | Size controls |
| `notificationsEnabled`, `setNotificationsEnabled` | state, action | Reminder switch |
| `notificationTime`, `setNotificationTime` | state, action | Reminder time |
| `exportBackupJSON`, `importBackupJSON` | actions | Backup card |
| `replayTour` | action | Tour link |
| `triggerHaptic` | action | Feedback on most controls |

Coupling inside the store that shapes the behaviour here: `setTheme('light')` also turns night-reading off (`src/lib/store.tsx:426-431`); `setHighContrast(true)` turns night-reading off (`src/lib/store.tsx:433-438`); `setNightReadingMode(true)` forces the dark theme and turns high contrast off (`src/lib/store.tsx:440-446`); `setFontSize` rounds to the nearest 0.5 and clamps to 12–24 (`src/lib/store.tsx:452-457`).

Not from the store:

- Entitlements (`src/lib/entitlements.ts`): `isPremium`, `getDeveloperPremiumSync`, `setDeveloperPremium`, `subscribeEntitlementChange`. These read and write `alhamd:dev_premium` (`'true'` / `'false'`) and dispatch / listen for the window event `alhamd:entitlement_changed` (`src/lib/entitlements.ts:58-68`, `src/lib/entitlements.ts:82-95`).
- Journey developer helpers (`src/lib/journeyStore.ts`): `devResetTodayPacingLock` (`src/lib/journeyStore.ts:553`) and `devResetEntireJourney` (`src/lib/journeyStore.ts:567`). They rewrite `alhamd:journey_state:v1`; the second also removes `alhamd:journey_onboarded:v1`. Both go through `saveJourneyState`, which dispatches `alhamd:journey_updated` (`src/lib/journeyStore.ts:388-394`); the store listens for it and reloads.

This file has no direct `localStorage` or `sessionStorage` calls.

### Local state, refs, memos

| State / ref | Initial | Drives |
|---|---|---|
| `isTimePickerOpen` (`:96`) | `false` | Time-picker overlay |
| `modalType` (`:97`) | `'none'` | Which of About / Content review / Privacy / Paywall is open |
| `importStatus` (`:98`) | `null` | The status banner. Despite the name it carries every transient message on this screen |
| `devPremium` (`:99`) | `getDeveloperPremiumSync()` | Developer switch and status text |
| `showDevPanel` (`:100`) | `false` | Test-tools panel |
| `fileInputRef` (`:101`) | — | Hidden file input for import |

No memos.

### Effects, timers, browser APIs

- Effect (`:103-106`): resolves `isPremium()` into `devPremium` and subscribes to entitlement changes; the subscription is removed on unmount.
- Timers: `setTimeout` clears `importStatus` after 3500 ms (`:121`, `:155`, `:705`, `:718`) or 4000 ms (`:135`). The ids are not stored, so they are neither cancelled when a newer message arrives nor on unmount.
- `Blob`, `URL.createObjectURL`, a detached `<a download>` that is clicked programmatically, `URL.revokeObjectURL` (`:111-117`).
- `FileReader.readAsText` (`:129-138`).
- `navigator.share`, falling back to `navigator.clipboard.writeText` (`:148-156`).
- `window.location.href` (`:146`).
- No `Notification` API, service worker, `matchMedia` or `Intl` use here, and none anywhere in `src` for notifications.
- No network requests.

### UI structure and behaviour

Root (`:160`): `div dir="rtl"` with page padding, `max-w-lg md:max-w-2xl lg:max-w-3xl`, `animate-fade-in`.

**Title** (`:162-169`): `h1` "الإعدادات" and "تخصيص المظهر، وضع القراءة الليلية المريح للعين قبل النوم، وتباين الإضاءة العالية، وخط العرض.".

**Status banner** (`:171-176`): rendered directly under the title while `importStatus` is set. It always shows a check icon followed by the message.

**Card 1 — appearance** (`:179-321`), heading "المظهر وراحة العين (الليل والنهار)":

- Chips "وضع القراءة الليلية مفعّل" and "تباين عالٍ مفعّل" when those modes are on.
- Two buttons, "داكن (ليل)" and "فاتح (نهار)", call `setTheme`.
- Row "وضع القراءة الليلية (قبل النوم)" with the description "يقلل من انبعاث الضوء الأزرق ويحوّل الخلفية إلى درجات داكنة أعمق وأكثر دفئاً لراحة العين والسكينة عند قراءة النعم قبل النوم." and a switch (`aria-label` "تفعيل وضع القراءة الليلية").
- Row "تحويل تباين النصوص للإضاءة العالية" with the description "يزيد من حدة تباين الحروف والحدود لتصبح النصوص أكثر وضوحاً تحت ضوء النهار الساطع أو الإضاءة القوية." and a switch with the same text as `aria-label`.
- Unless the theme is already light with high contrast: a preset button "تفعيل وضع الإضاءة الساطعة (نهار + تباين نصوص عالٍ)" that calls `setTheme('light')` then `setHighContrast(true)` (`:306-319`).

**Card 2 — font** (`:324-505`):

- Heading "خط العرض للقراءة الطويلة", hint "اختر الخط الأنسب لراحة عينيك", and four font cards from `DISPLAY_FONT_OPTIONS`, each rendered in its own font.
- Heading "حجم الخط بالرقم (١٢ – ٢٤)"; a "افتراضي (١٦)" button (`title` "إعادة الحجم الافتراضي (16)") when the size is not 16; a badge with the current size followed by "px".
- A minus button (`aria-label` "تصغير الخط", −1, disabled at 12), a range input 12–24 in steps of 0.5 (`aria-label` "شريط تحديد حجم الخط") with tick labels 12px / 16px / 20px / 24px, a plus button ("تكبير الخط", +1, disabled at 24), and a number input ("إدخال رقم حجم الخط").
- The number input is controlled by `fontSize` and calls `setFontSize` on every keystroke (`:466-469`). Because the store clamps at once, typing "18" into the emptied field produces 24 *(runtime-checked)*: "1" becomes 12, then "128" becomes 24.
- A preview box: the ayah "﴿وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا﴾", the paragraph "التأمل الهادئ في النعم المألوفة يعيد للقلب يقظته وسكينته، ويجعل القراءة الطويلة في سير النعم أنساً يورث الحمد والشكر.", the line `الخط: {font name} ({size}px)`, and one of "وضع القراءة الليلية: مفعّل (تقليل الضوء الأزرق قبل النوم)", "تباين النصوص: عالٍ (وضوح الإضاءة العالية)" or "تباين النصوص: قياسي هادئ".

**Card 3 — reminder** (`:508-547`): heading "التذكير اليومي", subtitle "حان وقت التفكّر والحمد", a switch bound to `notificationsEnabled`. When on: "وقت التذكير:" and a button showing the time through `formatArabicTime` (for the default, "٩:٠٠ م"), which opens the time picker. These controls only store a preference; no code schedules or shows a notification.

**Card 4 — backup** (`:550-582`): heading "النسخ الاحتياطي المحلي", text "احتفظ بنسخة من سجلك وتأملاتك في ملف آمن على جهازك يمكنك استرجاعه متى شئت.", buttons "تصدير ملف (JSON)" and "استيراد نسخة", and a hidden `<input type="file" accept=".json">`.

Export flow (`:108-123`):

1. `exportBackupJSON()` returns a pretty-printed JSON string.
2. It is wrapped in a `Blob` of type `application/json`; an object URL is created.
3. A detached `<a>` gets `download = alhamd-backup-{YYYY-MM-DD}.json` (UTC date) and is clicked; the object URL is revoked immediately afterwards.
4. Success: a `success` haptic and nothing visible. Failure: banner "تعذر تصدير النسخة الاحتياطية" for 3.5 s.

File content *(runtime-checked)*: top-level keys `version` (2), `exportedAt`, `settings`, `journal`, `completedDays`, `personalBlessings`, `journeyState`; `settings` holds `theme`, `highContrast`, `nightReadingMode`, `fontFamily`, `textSize`, `fontSize`, `notificationTime`, `notificationsEnabled`, `onboardingComplete`, `welcomeSeen`. Not included: the tasbih total, Hisn counts and favourites, audio preferences, analytics consent, the tour flag, the developer premium flag.

Import flow (`:125-140`):

1. "استيراد نسخة" clicks the hidden input.
2. On change, the first file is read as text. There is no size or type check beyond the `accept` hint, and no confirmation step.
3. If the text is non-empty, `importBackupJSON(text)` runs and its `message` is shown in the banner for 4 s. The `success` flag is ignored. Messages (`src/lib/store.tsx:635`, `src/lib/store.tsx:674`, `src/lib/store.tsx:676`, `src/lib/store.tsx:678`): "تم استرجاع بياناتك بنجاح.", "تم استرجاع النسخة الاحتياطية وترقيتها بنجاح.", "ملف النسخة الاحتياطية غير متوافق.", "تعذر قراءة ملف النسخة الاحتياطية.".
4. The input's value is reset so the same file can be chosen again.
5. An empty file, or a read error (no `onerror` handler), produces no message *(runtime-checked for the empty file)*.

Observed *(runtime-checked)*: failure messages appear with the same check icon as successes; with the page scrolled to the backup card the banner is above the visible area; a version-2 file with `settings.fontSize: 99` and `settings.fontFamily: "bogus"` was applied as-is (root font size 99 px for the rest of the session; the store's initialisers reject both values on the next load, `src/lib/store.tsx:144-165`).

**Link list** (`:585-639`), five full-width buttons:

| Label | Right-hand note | Action |
|---|---|---|
| "عن المحتوى والمراجعة العلمية" | "قيد المراجعة" | Opens `ContentReviewModal` |
| "عن تطبيق «الحمد»" | "رسالة التطبيق" | Opens `AboutModal`, which can switch to the review or privacy modal |
| "سياسة الخصوصية" | "على جهازك فقط" | Opens `PrivacyPolicyModal` |
| "إعادة الجولة التعريفية" | "٤ خطوات" | `replayTour()`: clears the tour flag. The tour itself renders only on the home tab (`src/App.tsx:261`), so nothing changes on this screen *(runtime-checked)* |
| "شارك التطبيق مع أحبابك" | "الدال على الخير" | `handleShareApp` |

Share flow (`:142-157`): builds `{ title: "تطبيق «الحمد» — نعمةٌ كلَّ يوم", text: "تطبيق هادئ لاستشعار نعم الله وتدبرها، نعمةٌ واحدة كلَّ يوم بلا سلاسل وبلا حسابات.", url: window.location.href }`. With `navigator.share` it opens the native sheet and ignores errors. Without it, the three parts are copied to the clipboard joined by newlines and the banner shows "تم نسخ رابط التطبيق بنجاح". The clipboard call is not wrapped in `try/catch`; when clipboard access is denied the promise rejection is unhandled and no message appears *(runtime-checked)*.

**Developer block** (`:641-736`), dashed border, always rendered; there is no build-time or hidden-gesture guard:

- Title "وضع المطور: تفعيل الرحلة"; description "تجربة ميزات «رحلتي» (المسار الكامل، اليوميات الخاصة، ووقفات المحاسبة) محلياً قبل الاشتراك في الخطة المدفوعة."; status line "الحالة الحالية: مفعّل محلياً (كامل ميزات رحلتي متاحة)" or "الحالة الحالية: غير مفعّل (الوضع المجاني — أول محطتين فقط)".
- A switch (`aria-label` "وضع المطور: تفعيل الرحلة") that calls `setDeveloperPremium(!devPremium)`. This writes `alhamd:dev_premium` and is the whole entitlement check, so turning it on unlocks the journey tab (`src/App.tsx:67`).
- A footer line "فحص محلي عبر" `isPremium()` "(بديل RevenueCat المؤقت)" and a text button "أدوات اختبار المسار" / "إخفاء أدوات الاختبار" that toggles the tools panel.
- Tools panel (`:698-734`):

  | Button | Effect | Banner |
  |---|---|---|
  | "تجاوز حد اليوم (فتح محطة جديدة)" | `devResetTodayPacingLock()`: sets today's unlocked-station count to 0 | "تم فتح حد اليوم في «رحلتي» لتجربة محطة إضافية." |
  | "إعادة تعيين «رحلتي» بالكامل" | `devResetEntireJourney()`: removes the journey state and its onboarding flag and saves a fresh default. No confirmation *(runtime-checked)* | "تمت إعادة ضبط مسار «رحلتي» من البداية." |
  | "معاينة نافذة الترقية (PremiumPaywallScreen)" | Opens the paywall | — |

**Time picker** (`:740-760`): overlay with the heading "وقت التذكير اليومي", an uncontrolled `<input type="time">` whose every change calls `setNotificationTime`, and a "تم" button that closes it. There is no cancel; the value is saved as it changes.

**Modals** (`:763-787`): `AboutModal`, `ContentReviewModal`, `PrivacyPolicyModal`, and `PremiumPaywallScreen` with `onClose` and an `onUnlocked` that sets `devPremium` and closes. No `triggerReason` is passed, so the paywall uses its default `'free_limit_reached'` and shows the "free preview finished" notice *(runtime-checked)*.

Overlay positioning *(runtime-checked)*: the time picker and all four modals are `fixed inset-0` elements rendered inside the Settings root, which keeps a transform after `animate-fade-in` finishes (computed `matrix(1, 0, 0, 1, 0, 0)`; `src/index.css:261-273`). They are therefore laid out against the Settings content box (about 2330 px tall at the default size) rather than the viewport, and they scroll with the page. Measured: the time-picker overlay was 390×2351 px; the About modal, opened with the link list in view, was centred about 340 px above the top of the viewport with only its bottom edge visible; the paywall preview, opened from the bottom of the page, was placed at the top of the page and was entirely off-screen. The bottom tab bar stays above all of them.

### Helpers, sub-components, constants

`DISPLAY_FONT_OPTIONS` (`:37-72`):

| `id` | `name` | `badge` | `description` | `fontStack` |
|---|---|---|---|---|
| `ibm` | IBM Plex Sans Arabic | "الافتراضي المتوازن" | "حروف واضحة ومتوازنة لواجهة التطبيق والقراءة اليومية." | `'IBM Plex Sans Arabic', sans-serif` |
| `noto-naskh` | Noto Naskh Arabic | "للقراءة الطويلة" | "خط نسخي هادئ مصمم لراحة العين في القراءة المطوّلة والتدبر." | `'Noto Naskh Arabic', 'Amiri', serif` |
| `amiri` | "Amiri (الأميري)" | "تراثي أدبي" | "طابع الكتب والمخطوطات الأصيلة مع مسافة سطور مريحة للتأمل." | `'Amiri', serif` |
| `tajawal` | "Tajawal (تجوال)" | "وضوح عالٍ" | "حروف مفتوحة وانسيابية تمنح وضوحاً ممتازاً في الإضاءة العالية." | `'Tajawal', sans-serif` |

`fontStack` is used only to style each card's own text (`:350`). The stack actually applied to the app is a second map in the store (`src/lib/store.tsx:362-367`), where the `tajawal` entry differs (`'Tajawal', 'IBM Plex Sans Arabic', sans-serif`).

The four switches are hand-written `button role="switch"` elements with the same markup repeated (`:247-265`, `:284-302`, `:520-533`, `:662-682`).

### Styling

- CSS custom properties: `--bg-sunken`, `--border-hairline`, `--ayah-color` (preview box); `GlassCard` supplies the card surfaces.
- Classes from `src/index.css`: `animate-fade-in`, `font-serif`, `font-quran`, `ayah-text`; the `text-[11px]` and `text-[10px]` utilities are redefined there as 0.75 rem and 0.6875 rem so they scale with the font-size setting (`src/index.css:234-242`).
- Hard-coded colours: violet `#6C63FF` / `#594DFF` (active buttons, switches), gold `#E4C368` / `#C8A951`, `#15152A`, `#1E1E38`, `#25232E`, `#2E2E4A`, `#AEAECB`, `#C7C4D8`, `#EDEDF5`, plus Tailwind `amber-400` and `emerald-400` that no theme remaps.
- The switch track uses `w-13` (52 px in Tailwind v4's spacing scale); the thumb moves with `-translate-x-6`.
- Breakpoints: `sm` puts the font cards and the developer tools in two columns; `md` / `lg` widen the page.
- Animation: `animate-fade-in` on the root, the tools panel and the time-picker overlay; 200 ms transitions on switches.

### Accessibility

- Switches use `role="switch"` and `aria-checked`. Three have an `aria-label`; the reminder switch has none and no `type` attribute (`:520-526`) *(runtime-checked)*.
- Theme buttons and font cards do not expose which option is selected (no `aria-pressed` or radio semantics).
- The status banner has no `role="status"` or `aria-live`.
- The time-picker overlay has no dialog role, focus management or Escape handling, and cannot be dismissed by tapping the backdrop.
- Range and number inputs have `aria-label`s; the minus / plus buttons too.
- Headings go from `h1` straight to `h3`.
- The hidden file input is `display: none` and is triggered by a visible button.

### Notes and quirks

- `Bell` is imported from `lucide-react` (`:8`) and never used.
- The `uppercase tracking-wider` classes on the Arabic section headings have no visible effect on Arabic script.
- The status text "الوضع المجاني — أول محطتين فقط" describes a free preview of two stations, but `App` blocks the journey tab entirely without the developer flag (`src/App.tsx:66-70`).
- User-facing strings contain code identifiers: `isPremium()`, "RevenueCat" and "PremiumPaywallScreen".
- Clearing the time input stores an empty string; the button then shows no time until reload, when the store falls back to 21:00 (`src/lib/store.tsx:172-174`). (Read from the code.)
- There is no control for analytics consent on this screen; the only caller of `setAnalyticsConsent` is the onboarding screen (`src/App.tsx:86`).
- There is no control to reset the lifetime tasbih total or to erase all data.

---

## `src/components/screens/PremiumPaywallScreen.tsx`

### Purpose

A modal that presents the premium "رحلتي" plan: three benefits, an annual and a lifetime option, a call-to-action, restore and dismiss links. There is no payment SDK. Pressing the call-to-action or restore shows an explanatory notice with a button that sets the local developer premium flag.

### Mounted from

| Where | When | Props passed |
|---|---|---|
| `src/App.tsx:209-218` | The journey tab is selected while `getDeveloperPremiumSync()` is false (`src/App.tsx:66-70`) | `triggerReason="preview"`, `onClose`, `onUnlocked` (closes and switches to the journey tab) |
| `src/components/screens/SettingsScreen.tsx:779-787` | "معاينة نافذة الترقية (PremiumPaywallScreen)" in the developer tools | `onClose`, `onUnlocked` |
| `src/components/journey/JourneyPathScreen.tsx:1379-1393` | `showPaywall` inside the journey screen | `triggerReason`, `completedFreeCount`, `freeStationLimit`, `targetStationTitle`, `onClose`, `onUnlocked` |

`JourneyPathScreen` imports it through a re-export shim, `src/components/journey/PremiumPaywallScreen.tsx`. A second shim, `src/components/journey/JourneyPaywall.tsx`, re-exports it under the alias `JourneyPaywall` and is imported by nothing.

Because `App` shows the paywall instead of opening the journey tab for non-premium users, the journey screen's own mount (the one that passes the free-limit props) is not reachable through the tab bars without the developer flag.

### Exports

- `PremiumPaywallScreenProps` (`:7`).
- `PremiumPaywallScreen` (`:16`), also the default export (`:301`).

### Props

| Name | Type | Required | What it does |
|---|---|---|---|
| `onClose` | `() => void` | yes | Close button, "العودة للمسار المجاني", and after the developer unlock |
| `onUnlocked` | `() => void` | no | Called after the developer unlock, before `onClose` (`:55`) |
| `triggerReason` | `'free_limit_reached' \| 'preview'` | no, default `'free_limit_reached'` | Shows the free-limit notice when `'free_limit_reached'`; also sent to analytics (and dropped there, see Notes) |
| `completedFreeCount` | `number` | no, default `FREE_STATION_LIMIT` (2) | First number in the notice, capped at `freeStationLimit` |
| `freeStationLimit` | `number` | no, default `FREE_STATION_LIMIT` (2) | Second number in the notice |
| `targetStationTitle` | `string` | no | Names the station the user tried to open, in the notice text |

All props are used.

### Store / persistence

No `useStore()`.

- `setDeveloperPremium(true)` (`:54`) writes `alhamd:dev_premium = 'true'` and dispatches `alhamd:entitlement_changed` (`src/lib/entitlements.ts:58-68`).
- `trackJourneyEvent` (`:28`, `:39`) appends to `alhamd:analytics_events_log` only when `alhamd:analytics_consent` is `'true'` (`src/lib/analytics.ts:20-23`). Nothing is sent over the network.

### Local state, refs, memos

| State | Initial | Drives |
|---|---|---|
| `selectedPlan` (`:24`) | `'annual'` | Selected plan card and the call-to-action label |
| `noticeMessage` (`:25`) | `null` | Notice box with the developer unlock button; replaces the privacy line |

Selecting a plan clears the notice (`:33-36`). The `benefits` array is rebuilt on every render (`:59-78`).

### Effects, timers, browser APIs

- Effect (`:27-31`): on mount and when `triggerReason` changes, `trackJourneyEvent('journey_paywall_viewed', { trigger_reason })`.
- No timers, no network, no payment API, no other browser APIs.

### UI structure and behaviour

Overlay (`:81-87`): `fixed inset-0 z-50`, dark blurred backdrop, `role="dialog"`, `aria-modal="true"`, `aria-labelledby="premium-paywall-title"`. Card (`:88`): `max-w-md md:max-w-lg`, `max-h-[calc(100vh-1.5rem)]`, `overflow-hidden`, a column of fixed-size sections.

1. **Top bar** (`:90-102`): chip "رحلتي · المسار الخاص" and a close button (`aria-label` "إغلاق").
2. **Free-limit notice** (`:105-121`), only for `'free_limit_reached'`: "وصلتَ إلى نهاية المعاينة المجانية ({n} من {limit} محطات)" and either "لإكمال بقية المحطات وفتح جميع منازل الرحلة ووقفات المحاسبة، يمكنك الترقية إلى الخطة الكاملة." or, with a target title, `لبدء التدبر في «{title}» وإكمال بقية محطات ومنازل الرحلة، يمكنك الترقية إلى الخطة الكاملة.`
3. **Heading** (`:124-134`): `h2` "رحلتك الخاصة مع النعم" and "مساحة هادئة للغوص أعمق في منازل الشكر والامتنان، صُممت لترافقك بخصوصية تامة وبلا أي ضغوط أو تنبيهات مزعجة.".
4. **Benefits** (`:137-155`), container `aria-label` "مزايا الخطة المدفوعة":

   | Icon | Title | Description |
   |---|---|---|
   | `Compass` | "الرحلة الشخصية الكاملة" | "فتح جميع محطات المسار ومنازل النِّعَم المتدرّجة لتسير معك خطوةً بخطوة وفق محاور اهتمامك ووتيرتك اليومية، بلا استعجال ولا ضغط." |
   | `BookOpen` | "اليوميات الخاصة والعمل اليومي" | "مساحة تدوين تأملية خاصة لكل محطة مع عمل يومي يسير؛ تُحفظ نصوصك محلياً على جهازك فقط ولا تُرسل لأي خادم خارجي." |
   | `PauseCircle` | "وقفات المحاسبة في ختام كل منزل" | "وقفة مراجعة هادئة عند إتمام المحطات السبع لكل منزل تجمع لك خلاصة تأملاتك لتستحضر أثر النعمة في يومك وسلوكك." |

5. **Plans** (`:158-234`): label "اختر الخطة المناسبة لك:" and a `role="radiogroup"` (`aria-label` "خيارات الاشتراك") with two `role="radio"` buttons:

   | Plan id | Title | Price text | Sub-line |
   |---|---|---|---|
   | `annual` (default) | "اشتراك سنوي" | "[السعر السنوي]" | "يُجدَّد سنوياً · يمكن إلغاؤه بأي وقت" |
   | `lifetime` | "مدى الحياة" | "[سعر مدى الحياة]" | "دفعة واحدة · دون اشتراك متكرر" |

   The price texts are literal placeholders in square brackets; no amount or currency exists in the code.
6. **Privacy line** (`:237-244`), while no notice is showing: "تبقى جميع يومياتك ووقفات محاسبتك محفوظة محلياً على جهازك وحده حتى بعد الاشتراك.".
7. **Notice** (`:247-258`), while `noticeMessage` is set: the message and a button "تفعيل الآن (وضع المطوّر)".
8. **Actions** (`:261-295`): the call-to-action, "متابعة مع الاشتراك السنوي" or "متابعة مع خطة مدى الحياة"; a link "استعادة المشتريات"; a link "العودة للمسار المجاني" (calls `onClose`); and the closing line "نعمة اليوم والأذكار والتسبيح تبقى مجانية دائماً وبلا إعلانات".

What the buttons do:

| Control | Handler | Result |
|---|---|---|
| Call-to-action | `handleSubscribeClick` (`:38-44`) | Logs `journey_paywall_cta_tapped` with `{ plan }` (if consent), then shows the notice "بوابة الاشتراك قيد الربط (RevenueCat). يمكنك تفعيل «رحلتي» للتجربة الآن عبر زر وضع المطوّر أدناه أو من الإعدادات.". No purchase is attempted; a `TODO: RevenueCat` comment marks the spot (`:40`) |
| "استعادة المشتريات" | `handleRestorePurchases` (`:46-51`) | Shows the notice "استعادة المشتريات ستعمل تلقائياً فور ربط خدمة RevenueCat. يمكنك حالياً التفعيل التجريبي من وضع المطوّر.". Nothing is restored (`TODO` at `:47`) |
| "تفعيل الآن (وضع المطوّر)" | `handleDevUnlockNow` (`:53-57`) | `setDeveloperPremium(true)`, then `onUnlocked?.()`, then `onClose()`. From `App` this lands the user on the journey tab with premium enabled *(runtime-checked)* |
| Close button, "العودة للمسار المجاني" | `onClose` | Closes |

Any user can therefore enable premium in two taps from the paywall (call-to-action, then the developer button).

Sizing *(runtime-checked, default font size, mounted from `App`)*: the card and the overlay both clip overflow and neither scrolls. The content is 782 px tall without the free-limit notice. It fits exactly at 390×844. At 360×640 the card is 614 px tall and at 320×568 it is 542 px; in both, the call-to-action, restore link, dismiss link and closing line fall below the card's lower edge and cannot be reached. Only the close button at the top remains.

### Helpers, sub-components, constants

`benefits` (`:59-78`, tabulated above). Plan ids `'annual' | 'lifetime'`. `FREE_STATION_LIMIT` (2) comes from `src/lib/entitlements.ts:3`. There are no price constants.

### Styling

- No CSS custom properties; all colours are hard-coded Tailwind arbitrary values: `#15152A` (card), `#1E1E38` with opacities `/50` and `/85`, `#2E2E4A`, violet `#6C63FF` / `#594DFF` with opacities `/12`, `/15`, `/20`, `/25`, `/35`, `/40`, `/50`, gold `#E4C368`, text `#EDEDF5`, `#C7C4D8`, `#AEAECB`; selected plan glow `rgba(108, 99, 255, 0.18)`.
- `src/index.css:88-92` remaps `bg-[#1E1E38]` and its `/90` and `/80` variants for the light theme, but not `/85` or `/50`. In the light theme the benefit cards, the unselected plan and the privacy line keep a dark navy background while their text is remapped to dark ink *(runtime-checked: background `rgba(30, 30, 56, 0.85)`, text `rgb(42, 31, 25)`)*.
- Classes from `src/index.css`: `animate-fade-in` (overlay and notice), `font-serif`.
- Breakpoints: `sm` adjusts padding and text size; `md` widens the card.
- Body copy uses `text-[10px]` and `text-[11px]` (0.6875 rem / 0.75 rem after the remap in `src/index.css:234-242`).

### Accessibility

- Dialog role, `aria-modal` and a labelled title are present.
- No initial focus, focus trap, focus restore or Escape handling: after opening, focus stays on the tab button behind the dialog and Escape does nothing *(runtime-checked)*. The backdrop does not close the dialog.
- The plan options use `role="radiogroup"` / `role="radio"` with `aria-checked`, but both stay in the tab order and arrow keys are not handled.
- The benefits container has an `aria-label` on a plain `div` with no role.
- No reduced-motion handling.

### Notes and quirks

- `journey_paywall_viewed` is sent with `{ trigger_reason }`, but `trackJourneyEvent` keeps only the keys `themes_count`, `pace`, `stage_id`, `station_index`, `plan` (`src/lib/analytics.ts:28`), so the stored event has empty metadata *(runtime-checked)*. The event's declared type has no metadata (`src/lib/analytics.ts:8`).
- The notices name the payment vendor and "developer mode" to end users.
- Opened from Settings, the dialog reports a reached free limit even though it is only a preview, and is positioned against the Settings page instead of the viewport (see `SettingsScreen`).
- The same transform issue applies by construction to the mount inside `JourneyPathScreen`, whose root also has `animate-fade-in` (`src/components/journey/JourneyPathScreen.tsx:633`). (Read from the code; not exercised at run time.)
- `getEntitlementStatus` and `toggleDeveloperPremium` in `src/lib/entitlements.ts` are not used by this component or by Settings.
