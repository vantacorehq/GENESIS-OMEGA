"""Generates all animated SVG art into assets/.   Run: python make_assets.py"""
import os, random
os.makedirs("assets", exist_ok=True)
r = random.Random(11)
FONT = "Orbitron,'Arial Black',sans-serif"
COL = ("#6ea8ff", "#c07bff", "#ff9a5c")
DEFS = '''<defs><radialGradient id="c"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffb347"/><stop offset="1" stop-color="#ff4500" stop-opacity="0"/></radialGradient>
<linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#6ea8ff"/><stop offset=".55" stop-color="#c07bff"/><stop offset="1" stop-color="#ff9a5c"/></linearGradient>
<filter id="g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs>'''


def save(name, w, h, body):
    open(f"assets/{name}.svg", "w").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{DEFS}'
        f'<rect width="{w}" height="{h}" fill="#02020c"/>{body}</svg>')


def stars(w, h, n):
    return "".join('<circle cx="%d" cy="%d" r="%.1f" fill="#fff"><animate attributeName="opacity" values="%.2f;1;%.2f" '
                   'dur="%.1fs" repeatCount="indefinite"/></circle>' % (r.randrange(w), r.randrange(h), r.random() * 1.5 + .2,
                                                                       r.random() * .3, r.random() * .3, 2 + r.random() * 4) for _ in range(n))


def rings(cx, cy, pal, d, k=1.0):
    s = ""
    for i in range(9):
        a = i * 21
        s += ('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round" '
              'stroke-dasharray="1 9" opacity=".9"><animateTransform attributeName="transform" type="rotate" '
              'from="%d %d %d" to="%d %d %d" dur="%ds" repeatCount="indefinite"/></ellipse>') % (
                 cx, cy, (40 + i * 24) * k, (16 + i * 9) * k, pal[i % 3], a, cx, cy, a + 360 * d, cx, cy, 14 + i * 2)
    return s + '<circle cx="%d" cy="%d" r="%d" fill="url(#c)"/>' % (cx, cy, 22 * k)


# 1. banner
g1, g2 = rings(820, 190, COL, 1, .55), rings(1040, 190, COL[::-1], -1, .55)
save("banner", 1200, 380, stars(1200, 380, 180) + f'<g filter="url(#g)">{g1}{g2}</g>{g1}{g2}'
     f'<text x="50" y="165" font-family="{FONT}" font-size="78" font-weight="900" letter-spacing="6" fill="url(#t)">GENESIS</text>'
     f'<text x="50" y="240" font-family="{FONT}" font-size="48" font-weight="900" letter-spacing="10" fill="#e8ecff">OMEGA</text>'
     '<text x="52" y="290" font-family="monospace" font-size="17" fill="#8fa8ff" letter-spacing="3">THE UNIVERSE ENGINE  //  60,000 STARS  //  REAL-TIME</text>')

# 2. collision (two galaxies merge, white flash, loop)
def galaxy(x0, y0, x1, y1, pal, d):
    inner = rings(600, 250, pal, d)
    return ('<g><animateTransform attributeName="transform" type="translate" values="%d %d;%d %d;%d %d;%d %d" keyTimes="0;.55;.9;1" dur="12s" repeatCount="indefinite"/>'
            '<animate attributeName="opacity" values="1;1;1;0" keyTimes="0;.55;.9;1" dur="12s" repeatCount="indefinite"/>'
            '<g filter="url(#g)">%s</g>%s</g>') % (x0, y0, x1, y1, x1, y1, x1, y1, inner, inner)
flash = ('<circle cx="600" cy="250" fill="#fff"><animate attributeName="r" values="0;0;300;0;0" keyTimes="0;.55;.62;.8;1" dur="12s" repeatCount="indefinite"/>'
         '<animate attributeName="opacity" values="0;0;.85;0;0" keyTimes="0;.55;.62;.8;1" dur="12s" repeatCount="indefinite"/></circle>')
save("collision", 1200, 500, stars(1200, 500, 160) + galaxy(-300, -40, -30, -6, COL, 1) + galaxy(300, 40, 30, 6, COL[::-1], -1) + flash +
     f'<text x="600" y="470" text-anchor="middle" font-family="{FONT}" font-size="26" letter-spacing="8" fill="url(#t)">TWO GALAXIES. ONE FATE.</text>')

# 3. stats
b = ""
for i, (a, l) in enumerate([("60,000", "STARS"), ("2.4 ms", "PER COSMOS STEP"), ("60 FPS", "IN YOUR POCKET"), ("0", "DEPENDENCIES")]):
    x = 20 + i * 295
    b += (f'<rect x="{x}" y="20" width="275" height="120" rx="18" fill="#0b0a22" stroke="{COL[i % 3]}" stroke-width="2"><animate attributeName="stroke-opacity" values=".25;1;.25" dur="{3 + i * .7}s" repeatCount="indefinite"/></rect>'
          f'<text x="{x + 137}" y="82" text-anchor="middle" font-family="\'Arial Black\',sans-serif" font-size="40" fill="url(#t)">{a}</text>'
          f'<text x="{x + 137}" y="112" text-anchor="middle" font-family="monospace" font-size="14" letter-spacing="4" fill="#8fa8ff">{l}</text>')
save("stats", 1200, 160, b)

# 4. divider (a comet crossing the page)
save("divider", 1200, 40, '<rect x="20" y="19" width="1160" height="2" fill="url(#t)" opacity=".5"/>'
     '<circle cy="20" r="6" fill="#fff"><animate attributeName="cx" values="20;1180;20" dur="6s" repeatCount="indefinite"/></circle>'
     '<circle cy="20" r="14" fill="url(#c)" opacity=".8"><animate attributeName="cx" values="20;1180;20" dur="6s" repeatCount="indefinite"/></circle>')

# 5. launch (rocket through a star field)
sk = ""
for _ in range(70):
    x, y = r.randrange(1200), r.randrange(-80, 440)
    sk += ('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#8fa8ff" stroke-width="1.5" opacity=".6"><animateTransform attributeName="transform" type="translate" '
           'from="0 0" to="0 520" dur="%.1fs" repeatCount="indefinite"/></line>') % (x, y, x, y + r.randrange(20, 70), r.uniform(1, 3))
rocket = ('<g><animateTransform attributeName="transform" type="translate" values="600 400;600 -120" dur="6s" repeatCount="indefinite"/>'
          '<ellipse cx="0" cy="62" rx="12" ry="40" fill="url(#c)"><animate attributeName="ry" values="30;55;30" dur=".25s" repeatCount="indefinite"/></ellipse>'
          '<path d="M0 -62 C18 -38 18 24 12 50 L-12 50 C-18 24 -18 -38 0 -62Z" fill="#e8ecff"/>'
          '<path d="M-12 20 L-34 56 L-12 46Z M12 20 L34 56 L12 46Z" fill="#c07bff"/><circle cx="0" cy="-18" r="7" fill="#6ea8ff"/></g>')
planet = '<circle cx="600" cy="820" r="450" fill="#0a1a4a"/><circle cx="600" cy="820" r="450" fill="none" stroke="#6ea8ff" stroke-width="4" filter="url(#g)"/>'
save("launch", 1200, 440, stars(1200, 440, 90) + sk + planet + rocket +
     f'<text x="40" y="60" font-family="{FONT}" font-size="34" letter-spacing="8" fill="url(#t)">THE ROAD TO INFINITY</text>')
print("assets/ ready:", ", ".join(sorted(os.listdir("assets"))))
