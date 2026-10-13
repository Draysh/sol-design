#!/usr/bin/env python3
"""The apps' type, cut for the web: writes src/lib/assets/fonts/ and src/lib/styles/fonts.css.

The faces are the apps' own, made WOFF2 and cut so a page fetches little,
their licences copied beside them: sol-quick's (`../quick/assets/fonts`) and
two worlds' title faces from their checkouts beside the kit
(`../../worlds/<world>/assets/fonts`), both openly licensed:

- Chakra Petch (Regular, Medium, SemiBold): HUD capitals; Latin only, about
  12 KB a weight.
- Corporate Logo Bold: titles (Saturn's flavour, and any without a face of
  its own here), subtitles and big figures.
- Keifont: Terra's and Luna's titles. Yuji Syuku: Mercury's titles.
- Zen Kaku Gothic New (Medium): Japanese in the sans.

Neptune's title face (Makinas 4) may not be handed on, so it is not here:
Neptune's pages set their titles in Corporate Logo. The title faces have one
weight each, declared for every weight so no page draws them thickened.

Each Japanese face is sliced the way Google Fonts slices them, and the
browser fetches a slice only when a page shows one of its characters
(`unicode-range`). The first slice holds the kana, the punctuation, Latin and
every kanji this kit's sources (and any folder named, Sol's web app's) are
written with, so a page of Sol's own words fetches that one file. The rest
of the JIS X 0208 level 1 kanji (the 2,965 in everyday use) follow in four
slices for words from data; anything rarer falls back to the system's Noto
CJK, as in the apps.

    python3 scripts/fonts-for-web.py [more source folders…]
    python3 scripts/fonts-for-web.py ../../hub/web/src     # Sol's words in the first slice too

Needs Python 3 with fontTools and brotli. Run it again after adding Japanese
words to the kit or to Sol's web app, and commit what it writes.
"""

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent
SOURCE = KIT.parent / "quick" / "assets" / "fonts"
WORLDS = KIT.parent.parent / "worlds"
OUT = KIT / "src" / "lib" / "assets" / "fonts"
CSS = KIT / "src" / "lib" / "styles" / "fonts.css"

# The CSS family, the file (in its folder), its weights in CSS, Latin only or Japanese.
FACES = [
    ("Chakra Petch", SOURCE / "ChakraPetch-Regular.ttf", "400", False),
    ("Chakra Petch", SOURCE / "ChakraPetch-Medium.ttf", "500", False),
    ("Chakra Petch", SOURCE / "ChakraPetch-SemiBold.ttf", "600 900", False),
    ("Corporate Logo ver3", SOURCE / "CorporateLogo-Bold.otf", "100 900", True),
    ("Keifont", WORLDS / "terra" / "assets" / "fonts" / "Keifont.ttf", "100 900", True),
    ("Yuji Syuku", WORLDS / "mercury" / "assets" / "fonts" / "YujiSyuku-Regular.ttf", "100 900", True),
    ("Zen Kaku Gothic New", SOURCE / "ZenKakuGothicNew-Medium.ttf", "300 700", True),
]
LICENCES = [
    SOURCE / "OFL-ChakraPetch.txt",
    SOURCE / "OFL-CorporateLogo.txt",
    SOURCE / "OFL-ZenKakuGothicNew.txt",
    WORLDS / "terra" / "assets" / "fonts" / "LICENSE-Keifont-Apache-2.0.txt",
    WORLDS / "terra" / "assets" / "fonts" / "LICENSE-Keifont-M+.txt",
    WORLDS / "terra" / "assets" / "fonts" / "Keifont-readme-ja.txt",
    WORLDS / "mercury" / "assets" / "fonts" / "OFL-YujiSyuku.txt",
]

# Latin, its punctuation, arrows and the few signs the HUD uses.
LATIN = [(0x20, 0x7E), (0xA0, 0x17F), (0x2000, 0x206F), (0x20AC, 0x20AC), (0x2190, 0x21FF), (0x2212, 0x2212),
         (0x25A0, 0x25FF)]
# Kana, Japanese punctuation, the upright forms for writing down, full-width forms.
KANA = [(0x3000, 0x30FF), (0x31F0, 0x31FF), (0xFE10, 0xFE1F), (0xFE30, 0xFE4F), (0xFF00, 0xFFEF)]
SLICES = 4


def level_one():
    """The 2,965 kanji of JIS X 0208 level 1, in code point order."""
    chars = set()
    for a in range(0xB0, 0xD0):
        for b in range(0xA1, 0xFF):
            try:
                chars.add(ord(bytes([a, b]).decode("euc_jp")))
            except UnicodeDecodeError:
                pass
    return sorted(c for c in chars if 0x4E00 <= c <= 0x9FFF)


def written(folders):
    """Every kanji in the text files under `folders`."""
    found = set()
    for folder in folders:
        for path in Path(folder).rglob("*"):
            if path.suffix not in {".svelte", ".ts", ".js", ".css", ".md", ".html", ".json"} or "node_modules" in path.parts:
                continue
            found.update(ord(c) for c in re.findall(r"[㐀-鿿]", path.read_text(errors="ignore")))
    return found


def ranges(codes):
    """Code points as CSS unicode-range, runs joined."""
    codes = sorted(codes)
    out, start, prev = [], None, None
    for c in codes:
        if start is None:
            start = prev = c
        elif c == prev + 1:
            prev = c
        else:
            out.append((start, prev))
            start = prev = c
    if start is not None:
        out.append((start, prev))
    return ", ".join(f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in out)


def expand(spans):
    return {c for a, b in spans for c in range(a, b + 1)}


def cut(font, codes, to):
    with tempfile.NamedTemporaryFile("w", suffix=".txt") as f:
        f.write(",".join(f"U+{c:X}" for c in sorted(codes)))
        f.flush()
        subprocess.run(["pyftsubset", str(font), f"--unicodes-file={f.name}", "--flavor=woff2",
                        f"--output-file={to}", "--layout-features=*", "--no-hinting", "--desubroutinize", "--name-IDs=*"],
                       check=True)


def main():
    folders = [KIT / "src"] + [Path(p) for p in sys.argv[1:]]
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for licence in LICENCES:
        shutil.copy(licence, OUT / licence.name)

    ours = written(folders)
    first = expand(LATIN) | expand(KANA) | ours
    rest = [c for c in level_one() if c not in ours]
    size = -(-len(rest) // SLICES)
    slices = [first] + [set(rest[i:i + size]) for i in range(0, len(rest), size)]

    rules = []
    for family, font, weight, japanese in FACES:
        parts = slices if japanese else [expand(LATIN)]
        for n, codes in enumerate(parts):
            file = f"{font.stem}.woff2" if not japanese else f"{font.stem}-{n}.woff2"
            cut(font, codes, OUT / file)
            rules.append(
                "@font-face {\n"
                f"\tfont-family: '{family}';\n"
                "\tfont-style: normal;\n"
                f"\tfont-weight: {weight};\n"
                "\tfont-display: swap;\n"
                f"\tsrc: url('../assets/fonts/{file}') format('woff2');\n"
                f"\tunicode-range: {ranges(codes)};\n"
                "}\n"
            )

    CSS.write_text(
        "/*\n"
        " * The apps' type for the web, written by scripts/fonts-for-web.py; don't edit by hand.\n"
        " * Chakra Petch, Corporate Logo, Yuji Syuku and Zen Kaku Gothic New under the SIL Open\n"
        " * Font License (assets/fonts/OFL-*.txt), Keifont under the Apache License 2.0 and the\n"
        " * M+ licence (assets/fonts/LICENSE-Keifont-*.txt). A Japanese face comes in slices, each fetched only\n"
        " * when a page shows one of its characters; the first has the kana and Sol's own words.\n"
        " */\n\n" + "\n".join(rules)
    )
    total = sum(p.stat().st_size for p in OUT.glob("*.woff2"))
    print(f"{OUT}: {len(list(OUT.glob('*.woff2')))} files, {total // 1024} KB; {len(ours)} kanji in the first slice")


if __name__ == "__main__":
    main()
