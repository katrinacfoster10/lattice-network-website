"""Build the founder portrait derivatives.

Two jobs. First, geometry: crop each source so the eye line sits at a
common fraction of frame height and faces land at a comparable scale,
measured from eye positions read off each original. Second, grade: a muted,
slightly soft treatment with shadows cooled toward ink navy — tuned per
image, because these three were shot under very different light and
identical numbers do not produce a matching result.

Originals are never written to. Run:  python3 founders.py <dest-dir>
"""
import sys
from PIL import Image, ImageEnhance, ImageChops

OUT_W, OUT_H = 800, 1000
RATIO = OUT_W / OUT_H            # 0.8  (4:5 portrait)
TARGET_EYE_Y = 0.37              # eye line, fraction of frame height
TARGET_IOD = 0.197               # eye separation, fraction of frame width
NAVY = (11, 27, 58)              # --lattice-ink-navy

# eye_y / eye_l / eye_r are fractions of the SOURCE dimensions, read off a
# percentage grid laid over each original.
#
# brightness : <1 pulls an over-bright studio backdrop back toward the others.
# sat        : colour multiplier (1.0 = untouched). ~0.70 => -30% saturation.
# contrast   : <1 softens. Suzanne's studio light is hardest, so she takes most.
# shadow_k   : strength of the navy shadow cool.
# skin_keep  : how much of the original colour is restored over skin hues,
#              so desaturation does not turn complexions grey.
JOBS = [
    dict(name="jill-earthy.webp",
         src="/Users/katrinacarroll-foster/Documents/The Lattice/Brand/Photos/Jill-Earthy-Speaker-Headshot-2024.jpg",
         eye_y=0.235, eye_l=0.320, eye_r=0.470,
         sat=0.66, contrast=0.97, shadow_k=0.16, skin_keep=0.55, brightness=1.00),
    dict(name="katrina-c-foster.webp",
         src="/Users/katrinacarroll-foster/Documents/Katrina - Professional/Headshots/New HeadShot.png",
         eye_y=0.324, eye_l=0.457, eye_r=0.593,
         sat=0.62, contrast=0.97, shadow_k=0.14, skin_keep=0.58, brightness=1.00),
    dict(name="suzanne-gill.webp",
         src="/Users/katrinacarroll-foster/Documents/The Lattice/Brand/Photos/Suzanne Gill.jpeg",
         eye_y=0.390, eye_l=0.440, eye_r=0.600,
         sat=0.74, contrast=0.95, shadow_k=0.22, skin_keep=0.60, brightness=0.93),
]


def crop_box(W, H, eye_y_f, eye_l, eye_r):
    """4:5 box sized so the eyes span TARGET_IOD of the width and sit at
    TARGET_EYE_Y down the height. Face scale is what makes the set read as
    one, so it sizes the box; the eye line is then placed inside it. Both
    clamp to whatever the source actually contains."""
    eye_y = eye_y_f * H
    eye_cx = (eye_l + eye_r) / 2 * W

    cw = (eye_r - eye_l) * W / TARGET_IOD   # size for a matched face scale
    ch = cw / RATIO
    if cw > W:                          # too wide for the source
        cw, ch = W, W / RATIO
    if ch > H:                          # too tall for the source
        ch, cw = H, H * RATIO
    cw, ch = int(round(cw)), int(round(ch))

    top = int(round(eye_y - TARGET_EYE_Y * ch))
    top = max(0, min(top, H - ch))
    left = int(round(eye_cx - cw / 2))
    left = max(0, min(left, W - cw))
    return left, top, cw, ch


def skin_mask(im):
    """Rough mask over skin-like hues, used to hold complexions back from
    the desaturation. Hue band plus a moderate-saturation gate, so hair and
    warm backgrounds are largely excluded."""
    h, s, v = im.convert("HSV").split()
    hue = h.point(lambda p: 255 if 2 <= p <= 32 else 0)
    sat = s.point(lambda p: 255 if 28 <= p <= 195 else 0)
    val = v.point(lambda p: 255 if p >= 55 else 0)
    return ImageChops.multiply(ImageChops.multiply(hue, sat), val)


def cool_shadows(im, k):
    """Pull the darks toward ink navy. The squared term keeps midtones and
    highlights almost untouched, so only shadow areas take the cast."""
    lum = im.convert("L")
    mask = lum.point(lambda p: int(k * 255 * ((1 - p / 255.0) ** 2)))
    return Image.composite(Image.new("RGB", im.size, NAVY), im, mask)


dest = sys.argv[1]
for j in JOBS:
    im = Image.open(j["src"]).convert("RGB")
    W, H = im.size
    left, top, cw, ch = crop_box(W, H, j["eye_y"], j["eye_l"], j["eye_r"])
    im = im.crop((left, top, left + cw, top + ch))

    # Never enlarge: a soft 2.5x upscale looks worse than a smaller sharp file.
    tw, th = (OUT_W, OUT_H) if cw >= OUT_W else (cw, ch)
    if (tw, th) != im.size:
        im = im.resize((tw, th), Image.LANCZOS)

    if j["brightness"] != 1.0:
        im = ImageEnhance.Brightness(im).enhance(j["brightness"])
    im = ImageEnhance.Contrast(im).enhance(j["contrast"])
    muted = ImageEnhance.Color(im).enhance(j["sat"])
    keep = skin_mask(im).point(lambda p: int(p * j["skin_keep"] / 255) if p else 0)
    im = Image.composite(im, muted, keep)
    im = cool_shadows(im, j["shadow_k"])

    path = f"{dest}/{j['name']}"
    for q in (86, 80, 74, 68):
        im.save(path, "WEBP", quality=q, method=6)
        import os
        if os.path.getsize(path) <= 200_000:
            break
    import os
    eye_actual = (j["eye_y"] * H - top) / ch
    iod = (j["eye_r"] - j["eye_l"]) * W * (tw / cw)
    print(f"{j['name']:24} crop {cw}x{ch}@({left},{top}) -> {tw}x{th}  "
          f"eyes {eye_actual*100:.0f}%  eye-dist {iod:.0f}px  "
          f"{os.path.getsize(path)/1024:.0f}KB")
