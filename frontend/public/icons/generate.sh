#!/bin/bash
# Generate Beauty World PWA icons using ImageMagick
# Run: cd frontend/public/icons && bash generate.sh
#
# Requires: sudo apt install imagemagick

set -e

echo "Generating Beauty World icons..."

# Create base SVG
cat > /tmp/bw_icon.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bgGrad)" rx="80"/>
  <text x="256" y="295" font-family="Georgia, 'Times New Roman', serif" font-size="240" font-weight="bold"
    text-anchor="middle" fill="#D4AF37" letter-spacing="-8">BW</text>
  <rect x="80" y="340" width="352" height="3" fill="#D4AF37" opacity="0.6"/>
  <text x="256" y="395" font-family="Arial, sans-serif" font-size="38" font-weight="300"
    text-anchor="middle" fill="#D4AF37" letter-spacing="8">BEAUTY WORLD</text>
</svg>
SVGEOF

# Maskable icon (logo centered with 20% safe zone padding)
cat > /tmp/bw_maskable.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#D4AF37"/>
  <rect x="40" y="40" width="432" height="432" fill="#0a0a0a" rx="40"/>
  <text x="256" y="290" font-family="Georgia, 'Times New Roman', serif" font-size="200" font-weight="bold"
    text-anchor="middle" fill="#D4AF37" letter-spacing="-6">BW</text>
  <text x="256" y="345" font-family="Arial, sans-serif" font-size="30" font-weight="300"
    text-anchor="middle" fill="#D4AF37" opacity="0.8" letter-spacing="6">BEAUTY</text>
</svg>
SVGEOF

# Convert SVG → PNG
convert -background none /tmp/bw_icon.svg -resize 512x512 icon-512.png
convert -background none /tmp/bw_icon.svg -resize 192x192 icon-192.png
convert -background none /tmp/bw_maskable.svg -resize 512x512 maskable-512.png

echo "✓ icon-512.png"
echo "✓ icon-192.png"
echo "✓ maskable-512.png"
echo ""
echo "Done! Icons are ready in frontend/public/icons/"
