#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_ICON="$ROOT_DIR/assets/icon.png"
APPICON_DIR="$ROOT_DIR/ios/Humorous/Images.xcassets/AppIcon.appiconset"

if [[ ! -f "$SRC_ICON" ]]; then
  echo "Source icon not found: $SRC_ICON" >&2
  exit 1
fi

mkdir -p "$APPICON_DIR"

# name, idiom, size-pt, scale, px
icons=(
  # iPhone
  "iphone-20@2x.png|iphone|20x20|2x|40"
  "iphone-20@3x.png|iphone|20x20|3x|60"
  "iphone-29@2x.png|iphone|29x29|2x|58"
  "iphone-29@3x.png|iphone|29x29|3x|87"
  "iphone-40@2x.png|iphone|40x40|2x|80"
  "iphone-40@3x.png|iphone|40x40|3x|120"
  "iphone-60@2x.png|iphone|60x60|2x|120"
  "iphone-60@3x.png|iphone|60x60|3x|180"
  # iPad
  "ipad-20.png|ipad|20x20|1x|20"
  "ipad-20@2x.png|ipad|20x20|2x|40"
  "ipad-29.png|ipad|29x29|1x|29"
  "ipad-29@2x.png|ipad|29x29|2x|58"
  "ipad-40.png|ipad|40x40|1x|40"
  "ipad-40@2x.png|ipad|40x40|2x|80"
  "ipad-76.png|ipad|76x76|1x|76"
  "ipad-76@2x.png|ipad|76x76|2x|152"
  "ipad-83.5@2x.png|ipad|83.5x83.5|2x|167"
  # App Store marketing
  "ios-marketing-1024.png|ios-marketing|1024x1024|1x|1024"
)

images_json=""

for entry in "${icons[@]}"; do
  IFS='|' read -r filename idiom size scale px <<< "$entry"
  out="$APPICON_DIR/$filename"
  sips -s format png -z "$px" "$px" "$SRC_ICON" --out "$out" >/dev/null
  images_json+="      {\n        \"size\": \"$size\",\n        \"idiom\": \"$idiom\",\n        \"filename\": \"$filename\",\n        \"scale\": \"$scale\"\n      },\n"
  echo "Generated $filename ($px x $px)"
done

# Remove trailing comma
images_json="${images_json%,\\n}"

cat > "$APPICON_DIR/Contents.json" <<JSON
{
  "images": [
$images_json
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
JSON

echo "\nWrote Contents.json and ${#icons[@]} icon images to $APPICON_DIR"
