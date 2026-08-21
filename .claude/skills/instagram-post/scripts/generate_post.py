#!/usr/bin/env python3
"""Generate a Finbot Instagram post (HTML + optional PNG).

Templates live in ../assets/templates/<variant>.html.
Themes and formats are defined below.

Differences from the LinkedIn generator:
  - Formats target Instagram: 4:5 feed (default), 1:1 square, 9:16 story/reel.
  - The 9:16 format adds top/bottom safe-area padding so important content
    doesn't get covered by the IG profile/UI overlays.
  - Posts can carry a page indicator (e.g. "1/5") for carousel slides.
  - An optional swipe cue ("SWIPE →") shows on carousel cover slides only.
  - The default CTA points to "Link în bio → finbot.ro" because Instagram
    posts don't have clickable URLs in the caption.

Usage examples:
  python generate_post.py --variant statement --theme bone \\
      --headline "Banii tăi. *Live.*" \\
      --subtext "Cashflow, taxe, facturi — într-un singur loc." \\
      --out ./out/01-banii-live --render-png

  python generate_post.py --variant statement --theme moss --format 9x16 \\
      --headline "ANAF.\\n*Fără stres.*" \\
      --eyebrow "TEASER" \\
      --out ./out/story-anaf --render-png
"""
from __future__ import annotations

import argparse
import re
import shutil
import string
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES = ROOT / "assets" / "templates"
LOGO_PATH = ROOT / "assets" / "logos" / "mark.svg"

# ---------- Themes (60% neutral / 30% primary / 10% accent) ----------
# Per brandbook: lime is reserved for accent; never used as logo mark fill.
THEMES = {
    "bone": {
        "bg": "#F5F3EC",
        "text": "#0A0A0A",
        "muted": "rgba(10,10,10,0.55)",
        "accent": "#CDFF00",
        "accent_text": "#0A0A0A",
        "grid_dot": "rgba(10,10,10,0.10)",
        "use_grid": True,
    },
    "ink": {
        "bg": "#0A0A0A",
        "text": "#F5F3EC",
        "muted": "rgba(245,243,236,0.55)",
        "accent": "#CDFF00",
        "accent_text": "#0A0A0A",
        "grid_dot": "rgba(245,243,236,0.06)",
        "use_grid": True,
    },
    "lime": {
        "bg": "#CDFF00",
        "text": "#0A0A0A",
        "muted": "rgba(10,10,10,0.65)",
        "accent": "#0A0A0A",
        "accent_text": "#CDFF00",
        "grid_dot": "rgba(10,10,10,0.12)",
        "use_grid": False,  # lime is loud enough on its own
    },
    "moss": {
        "bg": "#0E3D2F",
        "text": "#F5F3EC",
        "muted": "rgba(245,243,236,0.55)",
        "accent": "#CDFF00",
        "accent_text": "#0A0A0A",
        "grid_dot": "rgba(245,243,236,0.07)",
        "use_grid": True,
    },
}

# Instagram-recommended dimensions
FORMATS = {
    "4x5": (1080, 1350),   # portrait, default for IG feed
    "1x1": (1080, 1080),   # square — only use for grid-consistent carousels
    "9x16": (1080, 1920),  # story / reel cover
}

# 9:16 story safe areas: IG overlays profile/sticker UI in these bands.
# We bump the top/bottom padding so the logo + CTA aren't clipped or
# fighting against the swipe-up sticker / reaction bar.
STORY_TOP_SAFE = 220
STORY_BOTTOM_SAFE = 260

VARIANTS = ("statement", "number", "question")


# ---------- Helpers ----------

def load_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def auto_size_headline(text: str, format_key: str) -> int:
    """Pick a headline font-size (px) that scales with the text length.

    Tuned by eye against the 4:5 canvas. 9:16 is taller but the same width,
    so the same scale works — vertical space takes the slack."""
    chars = len(text)
    if format_key in ("4x5", "9x16"):
        if chars <= 18: return 168
        if chars <= 30: return 140
        if chars <= 48: return 112
        if chars <= 72: return 92
        return 76
    if format_key == "1x1":
        if chars <= 18: return 144
        if chars <= 30: return 120
        if chars <= 48: return 96
        if chars <= 72: return 80
        return 68
    return 100


def auto_size_question(text: str, format_key: str) -> int:
    chars = len(text)
    if format_key in ("4x5", "9x16"):
        if chars <= 40: return 100
        if chars <= 70: return 84
        if chars <= 110: return 68
        return 56
    if format_key == "1x1":
        if chars <= 40: return 88
        if chars <= 70: return 72
        if chars <= 110: return 60
        return 50
    return 60


def auto_size_number(text: str, format_key: str) -> tuple[int, int]:
    """Returns (number_size, unit_size) in px."""
    digits = len(text)
    if format_key in ("4x5", "9x16"):
        base = 360 if digits <= 2 else 300 if digits <= 3 else 240 if digits <= 4 else 192
    elif format_key == "1x1":
        base = 300 if digits <= 2 else 252 if digits <= 3 else 200 if digits <= 4 else 160
    else:
        base = 240 if digits <= 2 else 200 if digits <= 3 else 168 if digits <= 4 else 132
    unit = max(48, int(base * 0.28))
    return base, unit


HIGHLIGHT_RE = re.compile(r"\*([^*]+)\*")


def highlight_to_html(text: str) -> str:
    """Convert *highlighted* text to <em> wrapped in lime underline.

    The CSS for .headline em paints a chunky lime stripe behind the word.
    Useful for emphasising one or two words in a statement headline."""
    safe = (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;"))
    return HIGHLIGHT_RE.sub(r"<em>\1</em>", safe)


def linebreak_to_html(text: str) -> str:
    """Convert \\n into <br> so user can force line breaks if they want."""
    text = text.replace("\\n", "\n")
    safe = highlight_to_html(text)
    return safe.replace("\n", "<br>")


# ---------- Rendering ----------

@dataclass
class Content:
    headline: str = ""
    eyebrow: str = ""
    subtext: str = ""
    meta: str = "TEASER"
    cta: str = "Link în bio"
    cta_url: str = "finbot.ro"
    number: str = ""
    unit: str = ""
    source: str = ""
    attribution: str = ""
    page_indicator: str = ""  # e.g. "1/5" — overrides meta when set
    show_swipe: bool = False  # carousel cover cue


def render_html(variant: str, theme: str, format_key: str, content: Content) -> str:
    if variant not in VARIANTS:
        raise ValueError(f"unknown variant {variant!r}")
    if theme not in THEMES:
        raise ValueError(f"unknown theme {theme!r}")
    if format_key not in FORMATS:
        raise ValueError(f"unknown format {format_key!r}")

    width, height = FORMATS[format_key]
    theme_vars = THEMES[theme]
    is_story = format_key == "9x16"

    # Story-safe padding for the 9:16 format: IG overlays UI on top + bottom
    # bands. We push the header down and lift the CTA up so they're visible.
    story_top = STORY_TOP_SAFE if is_story else 0
    story_bottom = STORY_BOTTOM_SAFE if is_story else 0

    # Base CSS is templated too (it uses ${theme_*} and ${width}/${height})
    base_css_raw = load_text(TEMPLATES / "_base.css")
    base_css = string.Template(base_css_raw).safe_substitute(
        width=width, height=height,
        theme_bg=theme_vars["bg"],
        theme_text=theme_vars["text"],
        theme_muted=theme_vars["muted"],
        theme_accent=theme_vars["accent"],
        theme_accent_text=theme_vars["accent_text"],
        theme_grid_dot=theme_vars["grid_dot"],
        story_top=story_top,
        story_bottom=story_bottom,
    )

    template_text = load_text(TEMPLATES / f"{variant}.html")
    logo_svg = load_text(LOGO_PATH)

    # Variant-specific sizing
    headline_size = auto_size_headline(content.headline, format_key)
    question_size = auto_size_question(content.headline, format_key)
    number_size, unit_size = auto_size_number(content.number, format_key)

    # The page indicator wins over `meta` when both are present. This way a
    # carousel slide's top-right corner reads "1/5" instead of duplicating
    # both editorial label and progress.
    meta_text = content.page_indicator if content.page_indicator else content.meta

    # Conditional content blocks
    eyebrow_block = (
        f'<p class="eyebrow">{content.eyebrow}</p>' if content.eyebrow else ""
    )
    subtext_block = (
        f'<hr class="accent-line"><p class="subtext">{linebreak_to_html(content.subtext)}</p>'
        if content.subtext else ""
    )
    source_block = (
        f'<p class="source">{content.source}</p>' if content.source else ""
    )
    attribution_block = (
        f'<p class="attribution">{content.attribution}</p>' if content.attribution else ""
    )
    swipe_block = (
        '<div class="swipe-cue"><span>SWIPE</span></div>' if content.show_swipe else ""
    )

    body_classes = []
    if theme_vars["use_grid"]:
        body_classes.append("has-grid")
    if is_story:
        body_classes.append("is-story")
    body_class = " ".join(body_classes)

    fields = {
        "width": width,
        "height": height,
        "base_css": base_css,
        "logo_svg": logo_svg,
        "theme_bg": theme_vars["bg"],
        "theme_text": theme_vars["text"],
        "theme_muted": theme_vars["muted"],
        "theme_accent": theme_vars["accent"],
        "theme_accent_text": theme_vars["accent_text"],
        "grid_class": body_class,
        "headline": content.headline,
        "headline_html": linebreak_to_html(content.headline),
        "headline_size": headline_size,
        "question_size": question_size,
        "number": content.number,
        "unit": content.unit,
        "number_size": number_size,
        "unit_size": unit_size,
        "eyebrow_block": eyebrow_block,
        "subtext_block": subtext_block,
        "source_block": source_block,
        "attribution_block": attribution_block,
        "swipe_block": swipe_block,
        "meta": meta_text,
        "cta": content.cta,
        "cta_url": content.cta_url,
    }

    return string.Template(template_text).safe_substitute(fields)


# ---------- PNG render via Chrome headless ----------

def find_chrome() -> str | None:
    candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        shutil.which("chromium"),
        shutil.which("google-chrome"),
        shutil.which("chrome"),
    ]
    for c in candidates:
        if c and Path(c).exists():
            return c
    return None


def render_png(html_path: Path, png_path: Path, width: int, height: int) -> None:
    chrome = find_chrome()
    if not chrome:
        print("WARN: Chrome not found, skipping PNG render. "
              "Install Google Chrome or use Preview to export.",
              file=sys.stderr)
        return
    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-sandbox",
        f"--screenshot={png_path}",
        f"--window-size={width},{height}",
        "--force-device-scale-factor=2",
        "--virtual-time-budget=4000",
        f"file://{html_path.resolve()}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Chrome failed: {result.stderr}", file=sys.stderr)


# ---------- CLI ----------

def main() -> int:
    p = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description=__doc__,
    )
    p.add_argument("--variant", choices=VARIANTS, required=True,
                   help="statement = central message; number = hero stat; "
                        "question = engagement-driving question")
    p.add_argument("--theme", choices=list(THEMES), default="bone")
    p.add_argument("--format", choices=list(FORMATS), default="4x5",
                   dest="format_key",
                   help="4x5 = feed portrait (default); 1x1 = square; "
                        "9x16 = story / reel cover (with safe areas)")

    p.add_argument("--headline", required=True,
                   help="Main text. Use *word* for lime-highlight on statement. "
                        "Use \\n for forced line breaks.")
    p.add_argument("--eyebrow", default="",
                   help="Small mono label above the headline (e.g. 'CIFRĂ · 02')")
    p.add_argument("--subtext", default="",
                   help="Optional supporting line under the headline (statement only)")
    p.add_argument("--meta", default="TEASER",
                   help="Mono text top-right (e.g. '01 / TEASER'). Ignored if "
                        "--page-indicator is set.")

    # number variant
    p.add_argument("--number", default="",
                   help="The hero number for variant=number (e.g. '41', '73%')")
    p.add_argument("--unit", default="",
                   help="Unit/suffix after the number (e.g. 'ore', 'h')")
    p.add_argument("--source", default="",
                   help="Small source line under the caption")

    # question variant
    p.add_argument("--attribution", default="",
                   help="Small line under the question (e.g. 'NIMENI NU ÎNTREABĂ')")

    # carousel-specific
    p.add_argument("--page-indicator", default="", dest="page_indicator",
                   help="Carousel page label, e.g. '1/5'. Overrides --meta.")
    p.add_argument("--swipe", action="store_true", dest="show_swipe",
                   help="Show a small 'SWIPE →' cue above the CTA. Use on "
                        "carousel cover slides only (slide 1).")

    # CTA
    p.add_argument("--cta", default="Link în bio",
                   help="Big CTA text (default: 'Link în bio'). On Instagram "
                        "the link is not clickable — keep it short and clear.")
    p.add_argument("--cta-url", default="finbot.ro", dest="cta_url")

    p.add_argument("--out", required=True,
                   help="Output path (without extension). HTML and optional PNG written.")
    p.add_argument("--render-png", action="store_true",
                   help="Also produce a PNG via Chrome headless (Retina 2x)")

    args = p.parse_args()

    content = Content(
        headline=args.headline,
        eyebrow=args.eyebrow,
        subtext=args.subtext,
        meta=args.meta,
        cta=args.cta,
        cta_url=args.cta_url,
        number=args.number,
        unit=args.unit,
        source=args.source,
        attribution=args.attribution,
        page_indicator=args.page_indicator,
        show_swipe=args.show_swipe,
    )

    html = render_html(args.variant, args.theme, args.format_key, content)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    html_path = out.with_suffix(".html")
    html_path.write_text(html, encoding="utf-8")
    print(f"HTML  → {html_path}")

    if args.render_png:
        width, height = FORMATS[args.format_key]
        png_path = out.with_suffix(".png")
        render_png(html_path, png_path, width, height)
        if png_path.exists():
            print(f"PNG   → {png_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
