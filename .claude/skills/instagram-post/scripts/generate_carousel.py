#!/usr/bin/env python3
"""Generate an Instagram carousel (multiple slides at the same aspect ratio).

A carousel post on Instagram is N images uploaded together. All slides
must share the same aspect ratio (4:5 recommended, or 1:1). Page numbers
help the viewer track progress; a swipe cue on the cover invites the next
slide.

The script reads a JSON spec describing all slides, then calls the
single-post renderer once per slide. It outputs:

  out/<slug>-1.html        out/<slug>-1.png
  out/<slug>-2.html        out/<slug>-2.png
  ...
  out/<slug>-preview.html  ← all slides side-by-side for review

Spec format (JSON):
{
  "slug": "cum-functioneaza-finbot",
  "format": "4x5",
  "default_theme": "bone",
  "theme_mix": ["bone", "ink", "moss", "lime", "bone"],   // optional, per slide
  "slides": [
    {
      "variant": "statement",
      "headline": "Banii tăi. *Live.*",
      "eyebrow": "CUM FUNCȚIONEAZĂ"
    },
    {
      "variant": "statement",
      "headline": "1. Conectezi conturile.",
      "subtext": "Bănci, ANAF, e-Factura. O dată."
    },
    {
      "variant": "statement",
      "headline": "Înscrie-te.",
      "subtext": "Lista de așteptare e deschisă."
    }
  ]
}

Conventions applied automatically:
  - Slide 1 gets the swipe cue (--swipe), unless `cover: false`.
  - Last slide has no swipe cue.
  - Each slide's meta is overridden with "K/N" (page indicator).
  - Each slide inherits format and default_theme; theme_mix overrides per-slide.

Usage:
  python generate_carousel.py --spec carousel.json \\
      --out social/design/instagram-posts/teaser-mvp-2026/05-cum-functioneaza \\
      --render-png
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Reuse the single-post renderer
from generate_post import (
    Content,
    FORMATS,
    THEMES,
    VARIANTS,
    render_html,
    render_png,
)


PREVIEW_TEMPLATE = """<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><title>Carousel — ${slug}</title>
<style>
  body { margin: 0; padding: 32px; background: #1a1a1a; color: #f5f3ec;
         font-family: -apple-system, system-ui, sans-serif; }
  h1 { font-weight: 600; margin: 0 0 24px; font-size: 18px; letter-spacing: 0.04em; }
  .row { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; }
  .slide { flex-shrink: 0; }
  .slide iframe { display: block; border: 1px solid #333; border-radius: 8px;
                  background: #000; }
  .slide-label { font-size: 12px; opacity: 0.6; margin-top: 8px;
                 font-family: ui-monospace, monospace; letter-spacing: 0.08em; }
</style></head><body>
<h1>${slug} · ${format} · ${count} slides</h1>
<div class="row">
${slide_blocks}
</div>
</body></html>
"""


def build_preview(slug: str, format_key: str, slide_html_paths: list[Path]) -> str:
    width, height = FORMATS[format_key]
    # Scale down so the row fits comfortably even for long carousels
    preview_w = 360
    preview_h = int(height * (preview_w / width))
    blocks = []
    for i, p in enumerate(slide_html_paths, 1):
        blocks.append(
            f'  <div class="slide">\n'
            f'    <iframe src="{p.name}" width="{preview_w}" height="{preview_h}"></iframe>\n'
            f'    <div class="slide-label">{i} / {len(slide_html_paths)}</div>\n'
            f'  </div>'
        )
    return PREVIEW_TEMPLATE.replace("${slug}", slug) \
                           .replace("${format}", format_key) \
                           .replace("${count}", str(len(slide_html_paths))) \
                           .replace("${slide_blocks}", "\n".join(blocks))


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--spec", required=True, help="Path to carousel JSON spec")
    p.add_argument("--out", required=True,
                   help="Output base path (no extension). The script writes "
                        "<out>-1.html, <out>-2.html, ... and <out>-preview.html")
    p.add_argument("--render-png", action="store_true")
    args = p.parse_args()

    spec_path = Path(args.spec)
    spec = json.loads(spec_path.read_text(encoding="utf-8"))

    slug = spec.get("slug", spec_path.stem)
    format_key = spec.get("format", "4x5")
    default_theme = spec.get("default_theme", "bone")
    theme_mix = spec.get("theme_mix", [])
    slides = spec["slides"]
    n = len(slides)

    if format_key not in FORMATS:
        print(f"ERROR: unknown format {format_key!r}", file=sys.stderr)
        return 2
    if format_key == "9x16":
        # Carousels on IG don't support 9:16. Tell the user.
        print("ERROR: 9:16 is for stories/reels, not carousels. "
              "Use 4:5 or 1:1 for a carousel.", file=sys.stderr)
        return 2
    if not (2 <= n <= 10):
        print(f"ERROR: Instagram carousels accept 2-10 slides; got {n}", file=sys.stderr)
        return 2

    out_base = Path(args.out)
    out_base.parent.mkdir(parents=True, exist_ok=True)

    written: list[Path] = []
    for i, s in enumerate(slides, 1):
        variant = s.get("variant", "statement")
        if variant not in VARIANTS:
            print(f"ERROR: slide {i} has unknown variant {variant!r}", file=sys.stderr)
            return 2

        # Theme: per-slide override > theme_mix index > default
        theme = s.get("theme")
        if not theme and i - 1 < len(theme_mix):
            theme = theme_mix[i - 1]
        if not theme:
            theme = default_theme
        if theme not in THEMES:
            print(f"ERROR: slide {i} has unknown theme {theme!r}", file=sys.stderr)
            return 2

        # Auto cover/swipe: slide 1 unless explicitly set false
        is_cover = s.get("cover", i == 1)
        show_swipe = bool(s.get("swipe", is_cover and i == 1 and i != n))

        content = Content(
            headline=s.get("headline", ""),
            eyebrow=s.get("eyebrow", ""),
            subtext=s.get("subtext", ""),
            meta=s.get("meta", ""),
            cta=s.get("cta", "Link în bio"),
            cta_url=s.get("cta_url", "finbot.ro"),
            number=s.get("number", ""),
            unit=s.get("unit", ""),
            source=s.get("source", ""),
            attribution=s.get("attribution", ""),
            page_indicator=f"{i}/{n}",
            show_swipe=show_swipe,
        )

        html = render_html(variant, theme, format_key, content)
        slide_html_path = out_base.with_name(f"{out_base.name}-{i}.html")
        slide_html_path.write_text(html, encoding="utf-8")
        print(f"HTML  → {slide_html_path}")
        written.append(slide_html_path)

        if args.render_png:
            width, height = FORMATS[format_key]
            png_path = slide_html_path.with_suffix(".png")
            render_png(slide_html_path, png_path, width, height)
            if png_path.exists():
                print(f"PNG   → {png_path}")

    # Build the side-by-side preview
    preview_path = out_base.with_name(f"{out_base.name}-preview.html")
    preview_path.write_text(build_preview(slug, format_key, written), encoding="utf-8")
    print(f"\nPreview → {preview_path}")
    print(f"  Open this in a browser to see all {n} slides side by side.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
