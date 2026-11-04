#!/bin/bash
set -e
FF=~/Developer/menubar-player-screenshot-kit/source/node_modules/ffmpeg-static/ffmpeg
S=$(dirname "$0"); OUT=~/Developer/agundez-me/public/media/home
H264=(-c:v libx264 -pix_fmt yuv420p -profile:v high -preset slow -crf 24 -movflags +faststart -an)
enc() { "$FF" -y -loglevel error "$@"; }
case "$1" in
silex) enc -framerate 30 -i "$S/silex/frames/%05d.png" -vf "scale=1440:900" "${H264[@]}" "$OUT/silex.mp4" ;;
menubar) enc -ss 2.0 -to 9.2 -i ~/Developer/menubar-player-screenshot-kit/exports/video/Demo.mp4 -vf "crop=1728:1080:192:0,scale=1440:900:flags=lanczos,fps=30" "${H264[@]}" "$OUT/menubar.mp4" ;;
esac
