# Zwei Stufen: bauen mit allem, ausliefern mit nichts. Das Laufzeit-Image enthält weder
# node_modules noch Quelltext, nur .output — Nitro bündelt seine Abhängigkeiten dort hinein.
#
# node:24-slim ist Debian, nicht Alpine, und das ist Absicht. sharp und @takumi-rs/core (der
# OG-Image-Renderer) liefern vorgebaute Binärdateien gegen glibc; unter musl müssten beide aus
# dem Quelltext gebaut werden, was den Build verlangsamt und bei jedem Update neu brechen kann.
#
# Die Version ist auf 24.18 festgenagelt, dieselbe wie in .tool-versions und package.json.

# ── Build ───────────────────────────────────────────────────────────────────

FROM node:24.18.0-slim AS builder

WORKDIR /app

# Die Site-URL wird beim Build ins HTML geschrieben, nicht zur Laufzeit gelesen: routeRules
# prerendert jede Seite. Deshalb sind das Build-Args und keine Umgebungsvariablen des
# Laufzeit-Containers, und deshalb gibt es pro Umgebung ein eigenes Image.
#
# NUXT_SITE_ENV steuert die robots.txt: alles außer "production" liefert Disallow: /.
ARG NUXT_SITE_URL=https://shapeandflow.de
ARG NUXT_SITE_ENV=production
ENV NUXT_SITE_URL=$NUXT_SITE_URL \
    NUXT_SITE_ENV=$NUXT_SITE_ENV

# Hier steht bewusst kein NODE_ENV=production: npm ci wertet das aus und ließe dann die
# devDependencies weg. Der Build braucht sie alle — Tailwind, vue-tsc und den OG-Renderer —
# und postinstall ruft `nuxt prepare`, das ohne sie gar nicht erst startet. Nuxt setzt für das
# erzeugte Bundle selbst Produktionsmodus; NODE_ENV gehört ins Laufzeit-Image, nicht hierher.
#
# Zuerst nur die Manifeste, damit der Layer mit dem Installationsschritt so lange im Cache
# bleibt, wie sich die Abhängigkeiten nicht ändern.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Der Build geht ins Netz: @nuxt/fonts lädt Playfair Display bei Google und legt sie lokal ab,
# nuxt-link-checker prüft die internen Links. Ohne Egress schlägt er fehl.
RUN npm run build

# ── Laufzeit ────────────────────────────────────────────────────────────────

FROM node:24.18.0-slim AS runtime

# Der Aufräumschritt im Deploy hängt an diesem Label: `docker image prune -a --filter` entfernt
# damit gezielt die abgelösten Landing-Images und lässt den Booking-Stack auf derselben
# Maschine in Ruhe.
LABEL org.opencontainers.image.title="sf-landing"
LABEL org.opencontainers.image.source="https://github.com/schrrobe/shape-and-flow-landing-page"

WORKDIR /app

ENV NODE_ENV=production \
    NITRO_PORT=3000 \
    # 0.0.0.0 innerhalb des Containers, nicht auf dem Host: die Portveröffentlichung in
    # docker-compose.prod.yml bindet ausschließlich an 127.0.0.1.
    NITRO_HOST=0.0.0.0

# Der von node:24-slim mitgelieferte Benutzer, uid 1000. Kein Grund, den Server als root laufen
# zu lassen — er schreibt nichts.
COPY --from=builder --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

# `docker compose up --wait` wartet auf genau diesen Status. Ohne HEALTHCHECK gilt der
# Container als bereit, sobald der Prozess existiert, also bevor Nitro seinen Port geöffnet hat,
# und der Smoke-Test im Deploy liefe gegen eine noch geschlossene Verbindung.
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

CMD ["node", ".output/server/index.mjs"]
