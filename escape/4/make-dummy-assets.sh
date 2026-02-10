#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

ASSETS_DIR="escape/4/assets"
AUDIO_DIR="$ASSETS_DIR/audio"

mkdir -p "$ASSETS_DIR" "$AUDIO_DIR"

make_bg() {
  local out="$1"
  local base="$2"
  magick -size 1536x1024 "xc:${base}" \
    -fill "rgba(255,255,255,0.10)" -draw "rectangle 0,0 1536,220" \
    "$out"
}

make_icon() {
  local out="$1"
  local size="$2"
  local base="$3"
  magick -size "${size}x${size}" "xc:${base}" \
    -fill "rgba(0,0,0,0.35)" -draw "roundrectangle 18,18 $((size-18)),$((size-18)) 36,36" \
    -fill "rgba(255,255,255,0.18)" -draw "circle $((size/2)),$((size/2)) $((size/2)),$((size/6))" \
    "$out"
}

make_fog() {
  local out="$1"
  magick -size 1536x1024 "xc:none" \
    -fill "rgba(240,240,255,0.55)" -draw "rectangle 0,0 1536,1024" \
    -fill "rgba(255,255,255,0.15)" -draw "circle 200,240 200,40" \
    -fill "rgba(255,255,255,0.10)" -draw "circle 860,520 860,240" \
    -blur 0x12 \
    "$out"
}

make_bg "$ASSETS_DIR/record-room.png" "#2a3340"
make_bg "$ASSETS_DIR/hallway.png" "#2f2f3a"
make_bg "$ASSETS_DIR/storage.png" "#2a3a33"
make_bg "$ASSETS_DIR/washroom.png" "#253040"

# 大物（必要ならUIで使う）
make_icon "$ASSETS_DIR/drawers.png" 768 "#4b3b2a"
make_icon "$ASSETS_DIR/desk.png" 768 "#6a523a"
make_icon "$ASSETS_DIR/recorder.png" 512 "#3c3c3c"
make_icon "$ASSETS_DIR/clock.png" 512 "#3b4a5a"
make_icon "$ASSETS_DIR/window.png" 512 "#2b3f55"
make_icon "$ASSETS_DIR/panel.png" 512 "#2d3440"
make_icon "$ASSETS_DIR/lamp.png" 512 "#3a2b2b"
make_icon "$ASSETS_DIR/door.png" 768 "#3a2f28"

# アイテム
make_icon "$ASSETS_DIR/item-cloth.png" 512 "#4a5568"
make_icon "$ASSETS_DIR/item-flashlight.png" 512 "#2f4e73"
make_icon "$ASSETS_DIR/item-mirror.png" 512 "#3f3f5a"
make_icon "$ASSETS_DIR/item-red-film.png" 512 "#7a2b2b"
make_icon "$ASSETS_DIR/item-tape.png" 512 "#5a5a5a"
make_icon "$ASSETS_DIR/item-plug.png" 512 "#4a3b2a"

# 紙物
make_icon "$ASSETS_DIR/paper-record-template.png" 768 "#e8ddc8"
make_icon "$ASSETS_DIR/paper-ledger.png" 768 "#e9e2d5"
make_icon "$ASSETS_DIR/paper-ledger-scrap-1.png" 512 "#e9e2d5"
make_icon "$ASSETS_DIR/paper-ledger-scrap-2.png" 512 "#e9e2d5"
make_icon "$ASSETS_DIR/paper-ledger-scrap-3.png" 512 "#e9e2d5"
make_icon "$ASSETS_DIR/paper-torn-a.png" 512 "#e8ddc8"
make_icon "$ASSETS_DIR/paper-torn-b.png" 512 "#e8ddc8"
make_icon "$ASSETS_DIR/paper-fold.png" 512 "#e8ddc8"

# スタンプ
make_icon "$ASSETS_DIR/stamp-ki.png" 256 "#5b2f2a"
make_icon "$ASSETS_DIR/stamp-roku.png" 256 "#2a3b5b"
make_icon "$ASSETS_DIR/stamp-ame.png" 256 "#2a5b55"
make_icon "$ASSETS_DIR/stamp-oto.png" 256 "#5b5a2a"

make_fog "$ASSETS_DIR/fx-fog.png"

# 音（ダミー: 短い無音）
make_silence() {
  local out="$1"
  local seconds="$2"
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "anullsrc=r=44100:cl=mono" -t "$seconds" "$out"
}

make_silence "$AUDIO_DIR/amb-rain-loop.wav" 2.0
make_silence "$AUDIO_DIR/sfx-beep-short.wav" 0.2
make_silence "$AUDIO_DIR/sfx-beep-long.wav" 0.5
make_silence "$AUDIO_DIR/sfx-power-on.wav" 0.4
make_silence "$AUDIO_DIR/sfx-unlock.wav" 0.5
make_silence "$AUDIO_DIR/sfx-error.wav" 0.3

echo "dummy assets generated in $ASSETS_DIR"
