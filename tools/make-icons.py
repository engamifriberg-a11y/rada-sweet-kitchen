#!/usr/bin/env python3
"""
מייצר את אייקוני האפליקציה.

מצויר ישירות ב־PIL ולא מומר מ־SVG, כי בסביבת הבנייה אין ממיר SVG.
הכל מצויר פי 4 מהגודל הסופי ואז מוקטן, כדי לקבל קצוות חלקים.
"""

from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

SS = 4  # supersampling
A = (0x7B, 0x3F, 0xD4)
B = (0xB1, 0x4F, 0xC8)
C = (0xE0, 0x5C, 0x9E)


def lerp(c1, c2, t):
    return tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def grad(c):
    """מעבר אלכסוני סגול → ורוד"""
    g = Image.new("RGB", (c, c))
    px = g.load()
    for y in range(c):
        for x in range(c):
            t = (x + y) / (2 * (c - 1))
            px[x, y] = lerp(A, B, t / 0.52) if t < 0.52 else lerp(B, C, (t - 0.52) / 0.48)
    return g


def cake_mask(c, scale, dy=0):
    """מסכת העוגה: צללית מלאה, עם גל שמנת שחתוך מתוכה.
    צללית מלאה נקראת הרבה יותר טוב בגודל אייקון מאשר קווי מתאר."""
    import math

    m = Image.new("L", (c, c), 0)
    d = ImageDraw.Draw(m)
    w = c * scale
    x0 = (c - w) / 2
    y0 = (c - w) / 2 + dy

    def P(px, py):
        return (x0 + px * w, y0 + py * w)

    # גוף: דפנות ישרות, כיפה עדינה למעלה, תחתית מעוגלת
    left, right = 0.09, 0.91
    top, bottom = 0.605, 0.845
    dome = 0.105

    pts = []
    steps = 90
    for i in range(steps + 1):
        t = i / steps
        px = left + t * (right - left)
        py = top - math.sin(t * math.pi) * dome
        pts.append(P(px, py))
    pts.append(P(right, bottom))
    pts.append(P(left, bottom))
    d.polygon(pts, fill=255)
    # פינות תחתונות מעוגלות
    rr = w * 0.05
    d.rounded_rectangle([P(left, bottom - 0.1)[0], P(left, bottom - 0.1)[1],
                         P(right, bottom)[0], P(right, bottom)[1]],
                        radius=rr, fill=255)

    # גל שמנת — נחתך מהצללית
    lw = max(2, round(w * 0.050))
    wave = []
    for i in range(steps + 1):
        t = i / steps
        px = (left + 0.085) + t * ((right - 0.085) - (left + 0.085))
        py = 0.715 + math.sin(t * math.pi * 4 - math.pi / 2) * 0.028
        wave.append(P(px, py))
    d.line(wave, fill=0, width=lw, joint="curve")

    # נר
    cw = max(2, round(w * 0.055))
    d.line([P(0.50, 0.53), P(0.50, 0.345)], fill=255, width=cw)
    r = w * 0.075
    cx, cy = P(0.50, 0.275)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)

    return m


def rounded_mask(c, radius_ratio):
    m = Image.new("L", (c, c), 0)
    dm = ImageDraw.Draw(m)
    dm.rounded_rectangle([0, 0, c - 1, c - 1], radius=round(c * radius_ratio), fill=255)
    return m


def build(size, maskable=False):
    c = size * SS
    img = grad(c)

    out = Image.new("RGBA", (c, c), (0, 0, 0, 0))
    if maskable:
        # אזור בטוח: אנדרואיד חותך עד 20% מכל צד, אז הרקע מלא והעוגה קטנה
        out.paste(img, (0, 0))
        cm = cake_mask(c, 0.54, dy=-c * 0.01)
    else:
        out.paste(img, (0, 0), rounded_mask(c, 0.22))
        cm = cake_mask(c, 0.70, dy=-c * 0.01)

    white = Image.new("RGBA", (c, c), (255, 255, 255, 255))
    out = Image.composite(white, out, cm)
    if not maskable:
        # שמירה על הפינות המעוגלות אחרי ההרכבה
        out.putalpha(Image.composite(rounded_mask(c, 0.22), rounded_mask(c, 0.22), cm))
    return out.resize((size, size), Image.LANCZOS)


for s in (48, 72, 96, 144, 192, 256, 384, 512):
    build(s).save(OUT / f"icon-{s}.png")
build(512, maskable=True).save(OUT / "maskable-512.png")
build(1024).save(OUT / "icon-1024.png")

# אייקון אנדרואיד עגול
r = build(512)
m = Image.new("L", (512 * SS, 512 * SS), 0)
ImageDraw.Draw(m).ellipse([0, 0, 512 * SS - 1, 512 * SS - 1], fill=255)
big = build(512 * SS if False else 512)
circ = build(512).copy()
mask = Image.new("L", (512, 512), 0)
ImageDraw.Draw(mask).ellipse([0, 0, 511, 511], fill=255)
rnd = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
rnd.paste(build(512, maskable=True), (0, 0), mask)
rnd.save(OUT / "round-512.png")

print("wrote", len(list(OUT.glob("*.png"))), "icons to", OUT)

# ── נכסי אנדרואיד ────────────────────────────
# אייקון מדור קודם לכל צפיפות, ושכבת חזית לאייקון מסתגל (adaptive)
AND = Path(__file__).resolve().parent.parent / "android" / "app" / "src" / "main" / "res"

LEGACY = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
FOREGROUND = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}


def foreground(size):
    """שקוף לגמרי עם העוגה בלבן, בתוך אזור הבטיחות של אנדרואיד"""
    c = size * SS
    layer = Image.new("RGBA", (c, c), (0, 0, 0, 0))
    white = Image.new("RGBA", (c, c), (255, 255, 255, 255))
    cm = cake_mask(c, 0.50, dy=-c * 0.005)
    out = Image.composite(white, layer, cm)
    return out.resize((size, size), Image.LANCZOS)


def round_legacy(size):
    c = size * SS
    img = grad(c)
    out = Image.new("RGBA", (c, c), (0, 0, 0, 0))
    m = Image.new("L", (c, c), 0)
    ImageDraw.Draw(m).ellipse([0, 0, c - 1, c - 1], fill=255)
    out.paste(img, (0, 0), m)
    white = Image.new("RGBA", (c, c), (255, 255, 255, 255))
    cm = cake_mask(c, 0.62, dy=-c * 0.01)
    out = Image.composite(white, out, cm)
    out.putalpha(Image.composite(m, m, cm))
    return out.resize((size, size), Image.LANCZOS)


for dens, px in LEGACY.items():
    d = AND / f"mipmap-{dens}"
    d.mkdir(parents=True, exist_ok=True)
    build(px).save(d / "ic_launcher.png")
    round_legacy(px).save(d / "ic_launcher_round.png")

for dens, px in FOREGROUND.items():
    d = AND / f"mipmap-{dens}"
    d.mkdir(parents=True, exist_ok=True)
    foreground(px).save(d / "ic_launcher_foreground.png")

# מסך פתיחה
sp = AND / "drawable"
sp.mkdir(parents=True, exist_ok=True)
build(432).save(sp / "splash_logo.png")

print("wrote android launcher assets to", AND)
