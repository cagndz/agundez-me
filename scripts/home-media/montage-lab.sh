#!/bin/bash
set -e
FF=~/Developer/menubar-player-screenshot-kit/source/node_modules/ffmpeg-static/ffmpeg
cd "${WORK:?set WORK to the folder with the recordings}"; OUT=~/Developer/agundez-me/public/media/home
ff() { "$FF" -nostdin -y -loglevel error "$@"; }
dur() { "$FF" -nostdin -i "$1" 2>&1 | sed -n 's/.*Duration: 00:00:\([0-9.]*\).*/\1/p'; }
# name, start, end, and the crop in CSS px (x y width): 16:10, recorded at 2x (Chrome's screencast stops at 2560 px)
cut() { local w=$(($6 * 2)) h=$(($6 * 2 * 10 / 16)); ff -f concat -safe 0 -i "$1.ffconcat" -vf "fps=30,crop=$w:$h:$(($4 * 2)):$(($5 * 2)),scale=1440:900:flags=lanczos,trim=$2:$3,setpts=PTS-STARTPTS" -c:v libx264 -crf 14 -pix_fmt yuv420p "cut-$1.mp4"; }
cut dial 0.6 4.8 202 168 560
cut wallet 0.5 4.3 142 132 680
cut inspect 5.6 10.6 202 225 560
cut tooltip 0.5 3.9 168 236 560
X=0.4
o1=$(echo "$(dur cut-dial.mp4)-$X" | bc); o2=$(echo "$o1+$(dur cut-wallet.mp4)-$X" | bc); o3=$(echo "$o2+$(dur cut-inspect.mp4)-$X" | bc)
ff -i cut-dial.mp4 -i cut-wallet.mp4 -i cut-inspect.mp4 -i cut-tooltip.mp4 -filter_complex "[0][1]xfade=transition=fade:duration=$X:offset=$o1[a];[a][2]xfade=transition=fade:duration=$X:offset=$o2[b];[b][3]xfade=transition=fade:duration=$X:offset=$o3,format=yuv420p[v]" -map "[v]" -c:v libx264 -pix_fmt yuv420p -profile:v high -preset slow -crf 24 -movflags +faststart -an "$OUT/lab.mp4"
dur "$OUT/lab.mp4"
