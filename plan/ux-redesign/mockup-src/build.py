#!/usr/bin/env python3
"""Assemble self-contained mockup HTML files from src_*.html + shared blocks.

The colour tokens are NOT written here: they are generated from
src/v2/styles/tokens.ts, so the mockups and the running app cannot drift apart.
tests/vitest/v2/design-language.test.ts fails if a committed mockup carries a
stale block.
"""
import os, re, subprocess, sys, glob

from _icons import svg

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = "/home/user/materials-designer/plan/ux-redesign/mockups"
REGEN = os.path.join(SRC, "regen.sh")

def read(name):
    with open(os.path.join(SRC, name)) as f:
        return f.read()

def tokens():
    """The generated Mat3rial D3sign token block, scoped for the mockups."""
    return subprocess.run([REGEN, "html"], capture_output=True, text=True, check=True).stdout

def main():
    css = read("_shell.css").replace("@@TOKENS@@", tokens())
    js = read("_shell.js")
    vp = read("viewport_svg.js")
    parts = {
        "@@CSS@@": "<style>\n" + css + "\n</style>",
        "@@JS@@": "<script>\n" + vp + "\n</script>\n<script>\n" + js + "\n</script>",
        "@@WBAR@@": read("p_wbar.html"),
        "@@NAV@@": read("p_nav.html"),
        "@@VTOOLBAR@@": read("p_vtoolbar.html"),
        "@@TIMELINE@@": read("p_timeline.html"),
        "@@INSPECTOR@@": read("p_inspector.html"),
        "@@CONSOLE@@": read("p_console.html"),
        "@@STATUS@@": read("p_status.html"),
    }
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:] or None
    for src in sorted(glob.glob(os.path.join(SRC, "src_*.html"))):
        name = os.path.basename(src)[len("src_"):]
        if only and name not in only:
            continue
        html = read(os.path.basename(src))
        for k, v in parts.items():
            html = html.replace(k, v)
        # @@ICON:name@@ -> inline SVG. Runs after the partials are spliced in so
        # markers inside them expand too.
        html = re.sub(r"@@ICON:([a-z0-9-]+)@@", lambda m: svg(m.group(1)), html)
        assert "@@" not in html, f"unresolved marker in {name}: {html[html.index('@@'):html.index('@@')+30]!r}"
        with open(os.path.join(OUT, name), "w") as f:
            f.write(html)
        print(f"built {name}  ({len(html)//1024} KB)")

if __name__ == "__main__":
    main()
