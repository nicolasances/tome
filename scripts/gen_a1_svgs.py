#!/usr/bin/env python3
"""Generate SVG icons for A1 language learning modules."""

import os

OUT = "/Users/nicolasmatteazzi/Dev/toto/tome/public/images/modules"
os.makedirs(OUT, exist_ok=True)


def wrap(body: str) -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n{body}\n</svg>\n'


def c(cx, cy, r, fill="#000"):
    return f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>'


def r(x, y, w, h, rx=0, fill="#000"):
    extra = f' rx="{rx}"' if rx else ""
    return f'  <rect x="{x}" y="{y}" width="{w}" height="{h}"{extra} fill="{fill}"/>'


def p(d, fill="#000", rule=""):
    fr = f' fill-rule="{rule}"' if rule else ""
    return f'  <path d="{d}" fill="{fill}"{fr}/>'


SVGS = {}

# ── A1-01  Who Are You? (Person + ID badge) ──────────────────────────────────
SVGS["a1-01"] = wrap("\n".join([
    c(256, 128, 74),                              # head
    r(249, 200, 14, 44),                          # lanyard strap
    r(192, 242, 128, 88, rx=10),                  # badge card
    r(214, 264, 84, 13, rx=6, fill="#fff"),        # badge line 1 (cutout)
    r(214, 288, 60, 11, rx=5, fill="#fff"),        # badge line 2 (cutout)
    p("M 88 490 Q 88 330 256 330 Q 424 330 424 490 Z"),  # body/shoulders
]))

# ── A1-02  Numbers, Dates & Time (Clock) ─────────────────────────────────────
SVGS["a1-02"] = wrap("\n".join([
    c(256, 256, 210),                             # outer clock face
    c(256, 256, 162, fill="#fff"),                 # inner cutout → ring
    r(244, 70, 24, 55, fill="#fff"),               # 12 o'clock tick
    r(70, 244, 55, 24, fill="#fff"),               # 9 o'clock tick
    r(387, 244, 55, 24, fill="#fff"),              # 3 o'clock tick
    r(244, 387, 24, 55, fill="#fff"),              # 6 o'clock tick
    r(248, 128, 16, 132, rx=7),                   # hour hand (pointing up)
    r(252, 248, 120, 16, rx=7),                   # minute hand (pointing right)
    c(256, 256, 22),                              # center cap
]))

# ── A1-03  Colors, Shapes & Describing Things (Paint palette + brush) ────────
SVGS["a1-03"] = wrap("\n".join([
    # Palette body (large oval-ish rounded rect, tilted feel)
    p("M 310,120 C 400,120 440,180 440,256 C 440,350 370,400 280,400"
      " C 200,400 120,380 120,300 C 120,220 180,120 310,120 Z"),
    # Thumb hole
    c(182, 348, 52, fill="#fff"),
    # Paint blobs (white dots on palette = colour slots)
    c(230, 158, 30, fill="#fff"),
    c(320, 148, 30, fill="#fff"),
    c(395, 210, 30, fill="#fff"),
    c(400, 300, 30, fill="#fff"),
    c(330, 362, 30, fill="#fff"),
    # Paintbrush handle (diagonal) — parallelogram path
    p("M 412,68 L 436,80 L 474,320 L 450,332 Z"),
    # Brush ferrule (band near tip)
    p("M 408,86 L 440,74 L 444,96 L 412,108 Z", fill="#fff"),
]))

# ── A1-04  Family & Relationships (Two adults + child) ───────────────────────
SVGS["a1-04"] = wrap("\n".join([
    # Left adult
    c(140, 120, 58),
    p("M 70 380 Q 70 230 140 230 Q 210 230 210 380 Z"),
    # Right adult
    c(372, 120, 58),
    p("M 302 380 Q 302 230 372 230 Q 442 230 442 380 Z"),
    # Child (centre, shorter)
    c(256, 196, 46),
    p("M 196 420 Q 196 302 256 302 Q 316 302 316 420 Z"),
    # Ground line to join them
    r(70, 380, 372, 40, rx=4),
]))

# ── A1-05  Where You Live (House) ────────────────────────────────────────────
SVGS["a1-05"] = wrap("\n".join([
    # Roof triangle
    p("M 256 56 L 460 272 L 52 272 Z"),
    # House body
    r(90, 272, 332, 210, rx=6),
    # Door (white cutout)
    r(212, 356, 88, 126, rx=8, fill="#fff"),
    # Left window (white cutout)
    r(116, 312, 72, 68, rx=6, fill="#fff"),
    # Right window (white cutout)
    r(324, 312, 72, 68, rx=6, fill="#fff"),
    # Chimney
    r(330, 110, 42, 90, rx=4),
]))

# ── A1-06  Daily Routine (Alarm clock) ───────────────────────────────────────
SVGS["a1-06"] = wrap("\n".join([
    # Left bell
    c(148, 152, 54),
    r(120, 152, 56, 40, fill="#fff"),             # flat bottom of bell
    # Right bell
    c(364, 152, 54),
    r(336, 152, 56, 40, fill="#fff"),
    # Clock face
    c(256, 290, 178),
    c(256, 290, 136, fill="#fff"),                # inner cutout → ring
    # Hour hand
    r(248, 176, 16, 118, rx=7),
    # Minute hand (pointing to 9 — left)
    r(140, 282, 120, 16, rx=7),
    c(256, 290, 20),                              # centre cap
    # Feet
    r(160, 454, 48, 28, rx=14),
    r(304, 454, 48, 28, rx=14),
]))

# ── A1-07  Food & Eating Habits (Fork + plate + knife) ───────────────────────
SVGS["a1-07"] = wrap("\n".join([
    # Plate ring
    c(256, 280, 148),
    c(256, 280, 108, fill="#fff"),
    # Fork (left)
    r(122, 80, 14, 200, rx=6),                   # handle
    r(98, 80, 14, 90, rx=4),                      # outer left tine
    r(138, 80, 14, 90, rx=4),                     # outer right tine (shares centre with handle)
    r(108, 80, 42, 12, rx=4),                     # top bar joining tines
    r(108, 148, 42, 12, rx=4),                    # bottom bar of fork head
    # Knife (right)
    r(376, 80, 14, 320, rx=6),                    # handle + blade
    p("M 376,80 L 390,80 L 410,180 L 376,200 Z"), # blade taper
]))

# ── A1-08  Getting Around Town (Bus) ─────────────────────────────────────────
SVGS["a1-08"] = wrap("\n".join([
    # Bus body
    r(52, 140, 408, 242, rx=28),
    # Cab cutout (windscreen area — white rounded rect)
    r(72, 162, 120, 110, rx=14, fill="#fff"),
    # Passenger windows row
    r(220, 162, 64, 80, rx=10, fill="#fff"),
    r(306, 162, 64, 80, rx=10, fill="#fff"),
    r(392, 162, 48, 80, rx=10, fill="#fff"),
    # Wheels
    c(148, 382, 58),
    c(148, 382, 30, fill="#fff"),
    c(364, 382, 58),
    c(364, 382, 30, fill="#fff"),
    # Destination board (top strip)
    r(80, 108, 300, 36, rx=8),
    # Headlight
    r(56, 210, 38, 26, rx=6, fill="#fff"),
]))

# ── A1-09  Feelings & States (Smiley face) ───────────────────────────────────
SVGS["a1-09"] = wrap("\n".join([
    # Face circle
    c(256, 256, 210),
    # Eyes (white = transparent)
    c(176, 210, 34, fill="#fff"),
    c(336, 210, 34, fill="#fff"),
    # Smile (white crescent cutout)
    p("M 164,310 C 164,390 348,390 348,310 C 348,278 164,278 164,310 Z",
      fill="#fff"),
    # Small heart below face
    p("M 256 494 C 256 494 180 450 180 404 C 180 378 198 362 218 362"
      " C 236 362 256 378 256 378 C 256 378 276 362 294 362"
      " C 314 362 332 378 332 404 C 332 450 256 494 256 494 Z"),
]))

# ── A1-10  The Seasons & Weather (Sun + cloud) ───────────────────────────────
SVGS["a1-10"] = wrap("\n".join([
    # Sun rays (8-pointed star polygon)
    p("M 176 176 L 220 120 L 256 96 L 292 120 L 336 176 L 392 220"
      " L 416 256 L 392 292 L 336 336 L 292 392 L 256 416 L 220 392"
      " L 176 336 L 120 292 L 96 256 L 120 220 Z",
      fill="#000"),
    # Sun centre
    c(256, 256, 88),
    # Cloud (overlapping circles — covers lower-right of sun)
    c(320, 340, 74),
    c(256, 368, 68),
    c(390, 362, 58),
    c(194, 372, 52),
    r(194, 340, 254, 94, rx=4),                   # base of cloud
]))

# ── A1-11  Shopping Basics (Shopping bag) ────────────────────────────────────
SVGS["a1-11"] = wrap("\n".join([
    # Bag body (trapezoid via path)
    p("M 128 196 L 384 196 L 420 460 L 92 460 Z"),
    # Bag top ridge
    r(116, 180, 280, 22, rx=6),
    # Left handle arc
    p("M 164 180 C 164 108 220 72 256 72 C 292 72 348 108 348 180",
      fill="#fff"),                               # this 'erases' the gap under handle
    # Re-draw handles as solid rings
    # Outer handle path
    p("M 156 180 C 156 94 210 56 256 56 C 302 56 356 94 356 180"
      " L 340 180 C 340 106 298 74 256 74 C 214 74 172 106 172 180 Z"),
    # Price tag
    c(350, 340, 36),
    c(350, 340, 20, fill="#fff"),
    r(374, 330, 36, 20, rx=4),                    # tag tail
]))

# ── A1-12  Asking Questions & Getting Help (Speech bubble + ?) ───────────────
SVGS["a1-12"] = wrap("\n".join([
    # Speech bubble body
    p("M 68 68 L 444 68 L 444 360 L 310 360 L 256 456 L 256 360 L 68 360 Z",
      rule="evenodd"),
    # Round the bubble corners a bit via separate rect overlay
    r(68, 68, 376, 292, rx=36, fill="#000"),
    # Bubble tail (triangle already in the path above — redraw cleanly)
    p("M 256 360 L 310 360 L 256 456 Z"),
    # Question mark
    p("M 256 124 C 314 124 356 160 356 212 C 356 252 334 274 300 292"
      " C 282 302 274 312 274 330 L 238 330 C 238 300 252 280 278 264"
      " C 304 248 318 234 318 212 C 318 180 292 158 256 158 Z"),
    c(256, 358, 22),                              # dot of question mark
    # Clear the inner bubble (make it white so ? stands out)
    # Actually question mark is black on a... black bubble background?
    # Let's invert: white bubble with black question mark
    # Redo: bubble is black, inner is white, question mark is black
    r(80, 80, 352, 268, rx=30, fill="#fff"),       # inner white area
    p("M 256 124 C 314 124 356 160 356 212 C 356 252 334 274 300 292"
      " C 282 302 274 312 274 330 L 238 330 C 238 300 252 280 278 264"
      " C 304 248 318 234 318 212 C 318 180 292 158 256 158 Z"),
    c(256, 354, 22),
]))


for name, svg_content in SVGS.items():
    fpath = os.path.join(OUT, f"{name}.svg")
    with open(fpath, "w") as f:
        f.write(svg_content)
    print(f"✓ {name}.svg")

print(f"\nGenerated {len(SVGS)} SVGs → {OUT}")
