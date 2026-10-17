"""Bundle the multi-file repo into one portable page: python build.py -> dist/omega.html"""
import re
h = open("index.html").read()
h = h.replace('<link rel="stylesheet" href="style.css">', "<style>" + open("style.css").read() + "</style>")
h = re.sub(r'<script src="([^"]+)"></script>', lambda m: "<script>" + open(m.group(1)).read() + "</script>", h)
open("dist/omega.html", "w").write(h); print("dist/omega.html", len(h) // 1024, "KB")
