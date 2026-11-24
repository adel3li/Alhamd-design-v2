#!/bin/bash
# One batch of ten blessings, all four carousels (JR, GH, TR, HS), both themes, Full HD; then contact sheets to check.
#
#   (cd ../.. && bun run dev) &                          # the app on :3000, for the HS phone screen
#   bash tools/batch.sh 111                              # blessings 111–120
#
# Run from marketing/organic-kit. It records the batch in data/jr_progress/<hundred>.txt, fetches the new verses
# (data/verses.json for 1–100, data/verses_<k>.json from 101 on), rebuilds kit/content.js, captures the app screens,
# renders, and writes out/sheets/<first>_<theme>_<a|b>.png: two sheets per theme, five blessings each, one row a
# blessing, its carousels in the order JR, GH, TR, HS. Icons for the batch must already be in kit/icons_<k>.js.
set -eo pipefail
a=$1; b=$((a + 9)); k=$(( (a - 1) / 100 + 1 ))
cd "$(dirname "$0")/.."
missing=$(node -e "global.window={};['icons','icons_2','icons_3','icons_4'].forEach(f=>require('./kit/'+f+'.js'));const B=require('../../src/data/blessings_ar.json').blessings;console.log(B.filter(x=>x.order>=$a&&x.order<=$b&&!window.ICONS.I[window.ICONS.BY_BLESSING[x.id]]).map(x=>x.order).join(' '))")
if [ -n "$missing" ]; then echo "no icon yet for blessings: $missing (kit/icons_$k.js)"; exit 1; fi
cur=$(cat "data/jr_progress/$k.txt" 2>/dev/null || echo $(( (k - 1) * 100 )))
[ "$b" -gt "$cur" ] && echo "$b" > "data/jr_progress/$k.txt"
python3 tools/fetch_verses.py | grep -E "^BV-" | awk -v a="$a" -v b="$b" '{split($1,x,"-"); n=x[2]+0; if (n>=a && n<=b) print}'
python3 tools/build_content.py | cut -c1-60
node tools/capture-blessing-screens.cjs --from "$a" --to "$b"
ids=$(for n in $(seq "$a" "$b"); do nn=$(printf "%02d" "$n"); printf "JR-$nn-,GH-$nn-,TR-$nn-,HS-$nn-,"; done | sed 's/,$//')
node tools/render-stills.cjs --ids "$ids" --formats portrait 2>&1 | tail -1
mkdir -p out/sheets
for th in layl nahar; do
  for half in 0 5; do
    files=""
    for i in 0 1 2 3 4; do
      nn=$(printf "%02d" $((a + half + i)))
      for c in JR GH TR HS; do files="$files $(ls out/stills/$c-$nn-*/$c-$nn-*_${th}_portrait.png | sort -t- -k3 -n)"; done
    done
    python3 tools/sheet.py "out/sheets/${a}_${th}_$([ $half = 0 ] && echo a || echo b).png" $files --h 300 --cols 25 >/dev/null
  done
done
ls out/sheets/${a}_*.png
