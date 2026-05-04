"""Compose final App Store screenshots — v2 design.

Layout (1320x2868, iPhone 6.9" portrait):
  - Pure white background with very subtle brand-blue radial gradient (~6% opacity)
  - Top band (~700px): caption — modern geometric sans, dark text, comfortable scale
  - Mid (~1900px): screenshot floating with rounded corners and a soft shadow
  - Panda character anchored to the bottom-right (or left, alternating), partially
    overlapping the screenshot frame so it reads as a "presenter" of the screen

Run:
    python3 scripts/screenshots/compose.py
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, "screenshots", "raw")
OUT = os.path.join(ROOT, "screenshots", "final")
ASSETS = os.path.join(ROOT, "screenshots", "assets")
FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
os.makedirs(OUT, exist_ok=True)

W, H = 1320, 2868
BG_COLOR = (255, 255, 255)
ACCENT = (41, 121, 255)  # brand blue
TEXT_DARK = (24, 32, 56)
TEXT_MUTED = (110, 120, 140)

# Title: Instrument Serif (editorial premium, used by Linear/Vercel etc.)
# Subtitle: Outfit Regular (matches in-app typography)
# Falls back to macOS system fonts if files are missing.
BRAND_FONT_CANDIDATES = {
    "title": [
        os.path.join(FONTS, "InstrumentSerif-Regular.ttf"),
        "/System/Library/Fonts/Supplemental/Baskerville.ttc",
        "/System/Library/Fonts/Times.ttc",
    ],
    "title_italic": [
        os.path.join(FONTS, "InstrumentSerif-Italic.ttf"),
        "/System/Library/Fonts/Times.ttc",
    ],
    "subtitle": [
        os.path.join(FONTS, "Outfit-Regular.ttf"),
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ],
}

# Each composition: caption + which panda + which side panda anchors to.
COMPOSITIONS = [
    {
        "raw": "01-landing.png",
        "title_line1": "Land anywhere.",
        "title_line2": "You're already online.",
        "subtitle": "200+ destinations, ready in 2 minutes",
        "panda": "panda-traveler.png",
        "panda_side": "right",
    },
    {
        "raw": "02-browse.png",
        "title_line1": "200+ countries.",
        "title_line2": "Zero roaming bills.",
        "subtitle": "Europe, Asia, the Americas, beyond",
        "panda": "panda-globe.png",
        "panda_side": "left",
    },
    {
        "raw": "03-destination-plans.png",
        "title_line1": "From a layover",
        "title_line2": "to a semester abroad.",
        "subtitle": "Plans from $3.99. Students save 15%.",
        "panda": "panda-traveler.png",
        "panda_side": "right",
    },
    {
        "raw": "04-login.png",
        "title_line1": "Skip the password.",
        "title_line2": "Tap to sign in.",
        "subtitle": "Apple, Google, or email — your choice",
        "panda": "panda-traveler.png",
        "panda_side": "left",
    },
    {
        "raw": "05-profile.png",
        "title_line1": "Mission control",
        "title_line2": "for your data.",
        "subtitle": "Track usage. Top up in a tap.",
        "panda": "panda-chart.png",
        "panda_side": "left",
    },
    {
        "raw": "06-faq.png",
        "title_line1": "Honest pricing.",
        "title_line2": "Honest answers.",
        "subtitle": "No SIM swap. No surprise fees.",
        "panda": "panda-magnifier.png",
        "panda_side": "right",
    },
]


def load_font(size, role="subtitle"):
    """role: 'title' | 'title_italic' | 'subtitle'"""
    paths = BRAND_FONT_CANDIDATES[role]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def make_background():
    """White canvas with a very subtle brand-blue radial blob in the upper-third."""
    canvas = Image.new("RGB", (W, H), BG_COLOR).convert("RGBA")

    # Radial accent blob — soft, low opacity
    blob = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(blob)
    cx, cy = W // 2, int(H * 0.20)
    radius = 900
    for r in range(radius, 0, -8):
        # Inner = stronger, outer = transparent
        alpha = max(0, int(28 * (1 - r / radius)))
        bd.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(ACCENT[0], ACCENT[1], ACCENT[2], alpha),
        )
    blob = blob.filter(ImageFilter.GaussianBlur(120))
    canvas.alpha_composite(blob)

    return canvas


def round_corners(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, img.size[0], img.size[1]), radius=radius, fill=255
    )
    img.putalpha(mask)
    return img


def drop_shadow(img, offset=(0, 30), blur=50, opacity=70):
    pad = blur * 2
    shadow_size = (img.size[0] + pad * 2, img.size[1] + pad * 2)
    shadow_layer = Image.new("RGBA", shadow_size, (0, 0, 0, 0))
    if img.mode == "RGBA":
        alpha = img.split()[3]
    else:
        alpha = Image.new("L", img.size, 255)
    shadow_layer.paste(
        Image.new("RGBA", img.size, (0, 0, 0, opacity)),
        (pad + offset[0], pad + offset[1]),
        alpha,
    )
    return shadow_layer.filter(ImageFilter.GaussianBlur(blur))


def draw_centered_text(draw, text, font, y, color, width):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    draw.text((x, y), text, font=font, fill=color)


def compose_one(spec):
    raw_path = os.path.join(RAW, spec["raw"])
    if not os.path.exists(raw_path):
        print(f"  skip (raw missing): {spec['raw']}")
        return

    canvas = make_background()
    draw = ImageDraw.Draw(canvas)

    # Caption — Instrument Serif Regular for the title (editorial premium),
    # Outfit Regular for the subtitle (sans-serif pairing).
    # Instrument Serif has lighter visual weight than a bold sans, so we go larger.
    title_font = load_font(124, role="title")
    sub_font = load_font(40, role="subtitle")

    line_h = 138
    y = 110
    draw_centered_text(draw, spec["title_line1"], title_font, y, TEXT_DARK, W)
    y += line_h
    draw_centered_text(draw, spec["title_line2"], title_font, y, TEXT_DARK, W)
    y += line_h + 32
    draw_centered_text(draw, spec["subtitle"], sub_font, y, TEXT_MUTED, W)

    # Screenshot — positioned in the lower 2/3, clearly the hero of the frame
    raw = Image.open(raw_path).convert("RGBA")
    target_w = int(W * 0.70)  # 70% of canvas width (was 74; gives panda breathing room)
    scale = target_w / raw.size[0]
    target_h = int(raw.size[1] * scale)
    raw_scaled = raw.resize((target_w, target_h), Image.LANCZOS)
    raw_scaled = round_corners(raw_scaled, radius=68)

    # Soft shadow
    shadow = drop_shadow(raw_scaled, offset=(0, 36), blur=56, opacity=70)
    pad = 112
    screenshot_y = 720
    shadow_x = (W - raw_scaled.size[0]) // 2 - pad
    shadow_y = screenshot_y - pad
    canvas.alpha_composite(shadow, (shadow_x, shadow_y))

    paste_x = (W - raw_scaled.size[0]) // 2
    canvas.alpha_composite(raw_scaled, (paste_x, screenshot_y))

    # Panda — anchored to bottom of canvas, peeking from one side beside the screenshot
    panda_path = os.path.join(ASSETS, spec["panda"])
    if os.path.exists(panda_path):
        panda = Image.open(panda_path).convert("RGBA")
        # Smaller panda for screen 04 (login) so it doesn't crowd the form fields
        panda_target_h = 540 if spec["raw"].startswith("04-") else 720
        ps = panda_target_h / panda.size[1]
        panda_scaled = panda.resize(
            (int(panda.size[0] * ps), int(panda.size[1] * ps)), Image.LANCZOS
        )

        # Position: anchored at the bottom, partially overlapping the screenshot
        panda_y = H - panda_scaled.size[1] - 60

        if spec["panda_side"] == "right":
            panda_x = W - panda_scaled.size[0] + 40  # slight bleed past the right edge
        else:
            panda_x = -40  # slight bleed past the left edge

        # Make panda peek slightly above the screenshot bottom
        # Add a soft drop shadow under the panda for grounding
        ground_shadow = Image.new("RGBA", (panda_scaled.size[0], 80), (0, 0, 0, 0))
        ImageDraw.Draw(ground_shadow).ellipse(
            (60, 10, panda_scaled.size[0] - 60, 70), fill=(0, 0, 0, 60)
        )
        ground_shadow = ground_shadow.filter(ImageFilter.GaussianBlur(20))
        canvas.alpha_composite(
            ground_shadow,
            (panda_x, panda_y + panda_scaled.size[1] - 60),
        )

        canvas.alpha_composite(panda_scaled, (panda_x, panda_y))

    # Save
    out_name = spec["raw"].replace(".png", "-final.png")
    out_path = os.path.join(OUT, out_name)
    canvas.convert("RGB").save(out_path, "PNG", optimize=True)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"  -> {out_path} ({size_kb} KB)")


print("Composing App Store screenshots (v2 — clean white)...")
for spec in COMPOSITIONS:
    print(f"Composing {spec['raw']}")
    compose_one(spec)
print(f"\nDone. Final screenshots in {OUT}")
