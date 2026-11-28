# «الحمد» — organic content kit (no voice-over)

Everything for the first three months on social media: a 12-week plan (4 weeks pre-launch, 8 weeks soft launch),
a day-by-day calendar with captions, and every creative in both app themes — «ليل» (night, gold) and «نهار»
(day, cream and terracotta) — at every size the platforms use.

## What is in it

| Family | ID | What | Formats |
|---|---|---|---|
| نعمة اليوم | NB-01…40 | morning card for each of the app's 40 blessings | story, square, portrait, grid, pin, wide |
| سؤال للتأمّل | NP-01…40 | the blessing's journal question, for the evening story | story, square, portrait |
| دعاء النعمة | ND-01…40 | the blessing's duaa from the app | story, square, portrait |
| منشورات | PS-xx | idea, features on real screens, promises, questions, launch, seasons | portrait, square, grid, story, pin, wide, link |
| آيات الجمعة | SV-01…15 | verses on gratitude, Uthmani script, checked against two sources | square, portrait, story, wide |
| كاروسيل | CR-xx-n | value, identity, FAQ, Ramadan | portrait, story (TikTok photo mode), square |
| جرّبها الآن | TR-xx-n | the five pauses of 12 blessings | portrait, story, square |
| قصص | ST-xx | polls, quizzes, questions, templates, links | story |
| تحدّي الحمد | CH-00…07 | 7-day challenge | post / daily formats |
| العدّ التنازلي | CD-7…0 | countdown to launch | story, square, portrait |
| الهوية | BR-xx | avatar, highlight covers, X / Facebook / YouTube / LinkedIn covers (pre and post launch), link image | their sizes |
| Google Play | GP-01…07 | feature graphic and screenshots | 1024×500, 1080×1920 |
| خلفيات | WP-01…04 | wallpapers | iPhone, Android, desktop |
| ملصقات | SK-01…12 | WhatsApp stickers (transparent) + tray icon | 512×512, 96×96 |
| ريلز | NR-01…40, RL-01…16 | blessing reels and brand/feature reels, sound design only | 9:16 (+1:1 for hero reels) |

## A blessing package (every format for one blessing)

`kit/bundle.js` builds the full set of formats for one blessing from the app's own card, so a demo for one
blessing can be repeated for any of the 400. The blessings that get a package are listed in `BUNDLE` in
`tools/build_content.py`. Today there are ten, across seven categories: 5 «نعمة الصلاة», 37 «نعمة البصر», 15 «نعمة الماء»,
22 «نعمة الأم», 19 «نعمة العقل», 28 «نعمة الرزق», 29 «نعمة المال», 34 «نعمة حفظ الله», 36 «نعمة السمع», 14 «نعمة النوم».
Each packaged blessing also gets the kit's «جرّبها الآن» carousel (TR-nn). The kit's daily families (NB, NP, ND, NR)
now reach the first hundred blessings (`KIT_BLESSINGS`; icons for 41–100 are in `kit/icons.js`), while the 12-week plan
keeps to the first 40. `fetch_verses.py` adds the verse of any packaged blessing on its own (`BV-nn`, the app's
portion matched word by word).

| ID | What | Formats |
|---|---|---|
| GH-nn-1..2 | «غابت… ثم عادت»: the absence step, then the return step | portrait, story, square |
| HS-nn-1..6 | «من الشاشة الرئيسية»: cover, verse, hadith, tadabbur, scholar's words, the real app screen | portrait, story, square |
| JR-nn-1..10 | «الرحلة كاملة»: the card, then the pauses, the duaa and the journal (10 slides at most) | portrait, story, square |
| JM-&lt;stage&gt;-1..9 | «رحلتي»: the stage that holds the blessing, its seven stations and their daily actions | portrait, story, square |
| SQ-nn, AY-nn, PC-nn | story question, verse card, podcast episode cover | story · portrait, story, square · square |
| AN-nn | animated reel, drawn for each blessing (`animFor` in `bundle.js`): 5 the prayer times and a door that shuts and opens, 37 an eye, 15 a glass that runs dry and fills, 22 a house whose windows go dark and light again, 19 a web of points that scatters (with the words) and joins again, 28 three doors that shut and birds that come home, 29 a stack of coins that goes and comes back, one coin given away and replaced, 34 a point on its way inside rings that turn dangers aside, 36 sound waves and a line that falls silent, 14 the moon, three sleepless nights, then the dawn; any other package animates its own icon (`animIcon`) | 9:16 |
| VV-nn | the five pauses read aloud on the app's clock (needs `kit/voice.js`); drawn at 15 frames a second after the first five packages, encoded at 30 | 9:16 |

The package prints the hadith and the scholar's words, which the kit's daily families never do. They are copied
verbatim from the app with their review flags, and every creative that shows them, or a verse, is `review: true`:
nothing marked review is posted before a named reviewer approves the text. A paraphrased quote is printed with
«بتصرّف»; an unnamed one shows the app's own note (e.g. «مستفاد من شرح الحديث»). The verse is the app's portion in
Uthmani script from `data/verses.json` (`BV-nn`), pause marks included.

```bash
python3 tools/fetch_verses.py                        # add BV-nn for the blessing first
python3 tools/build_content.py                       # kit/content.js (CONTENT.bundle)
python3 tools/voice.py 5                             # out/audio/05: waqfa.mp3, podcast.mp3, podcast_script.md; kit/voice.js
node tools/capture-blessing-screens.cjs --n 5 --day 2027-11-28   # app screen for HS/JR (needs `bun run dev`)
node tools/render-stills.cjs --ids GH-05,HS-05,JR-05,JM-,SQ-05,AY-05,PC-05 --formats portrait
node tools/render-reels.cjs --ids AN-05,VV-05 --themes layl
python3 tools/build_demo.py 5 37 15 22 19 28 29 34 36 14   # out/demo/index.html: every package on one page, a tab each
```

Audio: `tools/voice.py` uses a temporary synthetic voice (Microsoft's neural Arabic voice through `edge-tts`,
`pip install edge-tts`) until a person records it. The Quran is never synthesised: the podcast plays a recorded
recitation from quran.com, which needs permission before anything is published, and words between ﴿ ﴾ inside an app
text (a tadabbur that quotes a verse) are never synthesised either: the whole verse is the recording; a few words of it
are cut from the reciter's recording of their verse by quran.com's word timings (the blessing's own verse, or one listed
in `quotedVerses` in `package_nn.json`; the tool checks the words are really there), and silence is left otherwise. A package can set the line that leads into its hadith (`hadithIntro` in `package_nn.json`: a hadith qudsi, a
supplication); otherwise a narration («جاء رجل…») is introduced without «قال رسول الله ﷺ». The podcast's linking lines are a draft in `data/scripts/podcast.json`, shared by every blessing (slots for the
title, surah, hadith source and the scholar), or `podcast_nn.json` for one; every other line is read from the app's data.
What the demo page says about one blessing (the animation's caption, the verse caption, the review notes) is in
`data/scripts/package_nn.json`.

## Four carousels for every blessing (JR, GH, TR, HS) and download packages

Every blessing gets four carousels, 4:5, in «ليل» and «نهار»: «الرحلة كاملة» (JR, up to 10 slides), «غابت… ثم عادت»
(GH, 2), «جرّبها الآن» (TR, 7: the five pauses as the app shows them) and «من الشاشة الرئيسية» (HS, up to 6, the last
one the app's real screen). They are made ten blessings at a time, in the app's order, one hundred per session:

| Hundred | Progress | Verses | Icons | Notes for the owner | Review page |
|---|---|---|---|---|---|
| 1–100 | `data/jr_progress/1.txt` | `data/verses.json` | `kit/icons.js` | `data/scripts/jr_notes.json` | https://claude.ai/artifact/Ua2D9MwPbGtw7nB4cycHyT |
| 101–200 | `data/jr_progress/2.txt` | `data/verses_2.json` | `kit/icons_2.js` | `data/scripts/jr_notes_2.json` | https://claude.ai/artifact/WN31ubRHQf5xsQWN9pzbiJ |
| 201–300 | `data/jr_progress/3.txt` | `data/verses_3.json` | `kit/icons_3.js` | `data/scripts/jr_notes_3.json` | https://claude.ai/artifact/F7hcD2KPjE2cd9p4s3JCnT |
| 301–400 | `data/jr_progress/4.txt` | `data/verses_4.json` | `kit/icons_4.js` | `data/scripts/jr_notes_4.json` | (made by its session) |

A progress file holds the last blessing done in its hundred; `BUNDLE` in `tools/build_content.py` is built from them.
One file of each kind per hundred, so sessions working on different hundreds never edit the same file, except
`kit/content.js`, which is generated: on a merge conflict there, run `python3 tools/build_content.py` again.

```bash
(cd ../.. && bun install && bun run dev) &       # the app on :3000, for the HS phone screen
# draw the batch's ten icons in kit/icons_<k>.js first (from 101 on), then:
bash tools/batch.sh 111                          # blessings 111–120: progress, verses, content, app screens, render, sheets
# check out/sheets/111_*.png, then:
python3 tools/build_gallery.py 2                 # out/gallery/2/: the review page for 101–200
```

`tools/capture-blessing-screens.cjs` finds the day the app shows each blessing (its rotation in `src/lib/dailyLogic.ts`)
and checks the title on screen; the captures are not in git (each machine makes its own). `fetch_verses.py` keeps the
verses it has and fetches only new ones (`--refresh` checks them all again); an app verse over several ayat is
matched too, joined by the end-of-ayah sign and number (`ayahEnd`). Notes go in the hundred's notes file
(`{"212": "…"}`) and show on the review page above that blessing.

**Downloads.** The packages live on the owner's Mac (`~/Downloads/claude work/alhamd-carousels/`), not in the review
page, which can hold 256 MB: for each blessing a 4K ZIP (2160×2700) and a Full HD ZIP (1080×1350), all four carousels
in both themes, JPEG at quality 95, with the captions and the slides to review in «نصوص المنشورات.txt». On the Mac:

```bash
node tools/render-stills.cjs --ids JR-01-,GH-01-,TR-01-,HS-01-,… --formats portrait                       # Full HD
node tools/render-stills.cjs --ids JR-01-,GH-01-,TR-01-,HS-01-,… --formats portrait --scale 2 --out out/stills-4k
python3 tools/export_package.py --from 1 --to 100 --dest "$HOME/Downloads/claude work/alhamd-carousels/1-100"
python3 tools/build_gallery.py 1 --local --out "$HOME/Downloads/claude work/alhamd-carousels/1-100"
```

The local copy of the page has a download button on each blessing for every size exported; open its `index.html` in
the browser. On the Mac, `alhamd-carousels/export.sh <from> <to>` runs all of it in one command for up to ~25 blessings
(the app server, the screenshots, the Full HD render with `PW_CHANNEL=chrome`, i.e. the installed Google Chrome, the ZIPs
and the page); a command there cannot reach a server another command started. Done so far: 1–100 in Full HD (1 GB).

| Batch | Blessings | Notes |
|---|---|---|
| 1 | 1–10 | all ten verses matched; every blessing has a hadith and a scholar's words (10 slides) |
| 2 | 11–20 | all verses matched; 10 slides each; nothing for the owner |
| 3 | 21–30 | 21 shows الرحمن 1–4 under «الرحمن: 1» in the app: `fetch_verses.py` now matches a run of consecutive ayat (end-of-ayah sign and number between them, `ayahEnd` in the verse); asked the owner about the app's reference |
| 4 | 31–40 | 32 (قريش 3–4) and 39 (العصر 1–3) span several ayat under one number in the app, same as 21 |
| 5 | 41–50 | 42 (الحشر 7) and 46 (المائدة 54) are long whole ayat whose blessing sits in one phrase: asked the owner whether the app should show a portion |
| 6 | 51–60 | 54 (الحج 78 whole, text at 77%) same question as 42 and 46 |
| 7 | 61–70 | all verses matched; 10 slides each; nothing for the owner |
| 8 | 71–80 | a whole ayah that opens with the hizb sign «۞» (74, 79) now drops it from the printed text, as portions already did (`full` keeps it); 79 (النساء 36) same portion question as 42 |
| 9 | 81–90 | 82 (المائدة 2 whole, text at 77%) same portion question |
| 10 | 91–100 | 92, 96, 97 and 99 have no hadith (9 slides); nothing for the owner |
| 11 | 101–110 | ten icons drawn (tahara, adhan, siyam, sadaqa, qiyam, istighfar, salatnabi, eid, haya, khushu); 101 (المائدة 6 whole, text at 70%) portion question; 110 (المؤمنون 1–2) reference question |

## How it works

- `kit/kit.html` renders any creative: `kit.html?id=PS-04&f=portrait&th=nahar` (reels: add `&t=3.2`).
- `kit/kit.js` — formats, themes, layout and text fitting; `kit/motion.js` — reels runtime;
  `kit/stills.js` and `kit/reels.js` — the creatives; `kit/icons.js` — one line icon per blessing.
- `kit/content.js` is generated by `tools/build_content.py` from the app's `src/data/blessings_ar.json`
  (only app-authored lines; the app's Quran, hadith and scholar fields are pending review and are not used)
  and `data/verses.json` (from `tools/fetch_verses.py`: quran.com Uthmani text, letters checked against Tanzil).
- App screens: `../promo-video/scenes/app/` («ليل») and `../promo-video/scenes/app-light/` («نهار»),
  captured with `../promo-video/tools/capture-app-screens.cjs [--theme light]`.

```bash
python3 tools/fetch_verses.py          # verses (network)
python3 tools/build_content.py         # kit/content.js
node tools/render-stills.cjs           # out/stills/<id>/<id>_<theme>_<format>.png  (+ meta.json)
node tools/render-reels.cjs            # out/reels/<id>/<id>_<theme>_<format>.mp4   (+ previews, posters)
python3 tools/build_plan.py            # plan/plan.json, plan/PLAN.md, out/plan/alhamd-content-calendar.xlsx
python3 tools/package.py               # out/package/*.zip
python3 tools/build_page.py            # out/page/ (the review page)
```

Options: `--ids PS-04,NB` (prefix match), `--formats story,square`, `--themes layl`; reels also `--at 1,4.5` for check frames.
Sound: `../promo-video/tools/sfx.py` (procedural effects, no music, peak −12 dBFS over a −42 dBFS room tone).

## The plan

`plan/PLAN.md` and the workbook: 84 days from Saturday 28 Nov 2026 (launch Saturday 26 Dec, end Friday 19 Feb 2027,
12 Ramadan 1448). The daily «نعمة اليوم» is the same blessing the app shows that date (`src/lib/dailyLogic.ts`).

Rules: no voice-over, no music (the package's voiced pieces are the exception, and carry no music either); verse cards are reviewed before posting; no hadith or scholar quotes; no people;
no invented numbers or reviews; no incentive for Play Store ratings.
