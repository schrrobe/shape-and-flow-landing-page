# Deployment auf den Hostinger VPS

## Wie die Seite ausgeliefert wird

Hybrid. Es läuft ein Node-Prozess, aber **jede Seite wird beim Build fertig gerendert**
(`routeRules: { '/**': { prerender: true } }` in `nuxt.config.ts`). Suchmaschinen und KI-Agenten
bekommen also vollständiges HTML ohne Rendering pro Aufruf, und `server/api/` bleibt für später
verfügbar, etwa für ein Kontaktformular. Am Rendering muss sich dafür nichts ändern.

Der Build erzeugt zwei Dinge unter `.output/`:

| Verzeichnis | Inhalt | Wer liefert es aus |
| --- | --- | --- |
| `.output/public/` | vorgerenderte HTML-Seiten, Bilder, Schriften, OG-Bilder, `sitemap.xml`, `robots.txt`, `llms.txt` | nginx direkt |
| `.output/server/` | der Node-Server | nur für alles, was nicht als Datei existiert |

## Bauen

```bash
npm ci
NUXT_SITE_ENV=production npm run build
```

Für die Dev-Instanz zusätzlich die Adresse überschreiben, damit Canonicals und Sitemap stimmen:

```bash
NUXT_SITE_ENV=staging NUXT_SITE_URL=https://dev.shapeandflow.de npm run build
```

`NUXT_SITE_ENV=staging` sorgt dafür, dass `robots.txt` dort `Disallow: /` ausliefert. Ohne diese
Variable konkurriert die Dev-Instanz im Google-Index mit der Produktion.

Der Build lässt `nuxt-link-checker` mitlaufen: ein toter interner Link fällt beim Bauen auf und
nicht erst im Livebetrieb.

## Wichtig: auf dem Server bauen, nicht lokal

`sharp` (Bildverarbeitung) und der OG-Image-Renderer bringen plattformspezifische Binärdateien mit.
Auf einem Mac erzeugte `node_modules` funktionieren auf einem Linux-VPS nicht. Also entweder direkt
auf dem Server bauen oder in einem CI-Job mit derselben Architektur wie der VPS.

Ablauf auf dem Server:

```bash
cd /var/www/shapeandflow.de
git pull
npm ci
NUXT_SITE_ENV=production npm run build
sudo systemctl restart shapeandflow
```

## systemd-Service

`/etc/systemd/system/shapeandflow.service`:

```ini
[Unit]
Description=Shape and Flow Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/shapeandflow.de
ExecStart=/usr/bin/node .output/server/index.mjs
Environment=NODE_ENV=production
Environment=NITRO_PORT=3000
Environment=NITRO_HOST=127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`NITRO_HOST=127.0.0.1` ist wichtig: der Node-Prozess soll ausschließlich lokal erreichbar sein, nach
außen spricht nginx. Ohne diese Zeile hört Node auf allen Interfaces und ist unter Port 3000 direkt
aus dem Internet erreichbar, ohne TLS und ohne die nginx-Regeln.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now shapeandflow
sudo systemctl status shapeandflow
```

Die Dev-Instanz bekommt eine zweite Unit mit eigenem `WorkingDirectory` und `NITRO_PORT=3001`.

## nginx

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name shapeandflow.de;

    ssl_certificate     /etc/letsencrypt/live/shapeandflow.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shapeandflow.de/privkey.pem;

    root /var/www/shapeandflow.de/.output/public;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/xml text/plain;

    # Dateinamen sind gehasht, der Browser darf sie also dauerhaft behalten.
    location ~* ^/(_nuxt|_fonts|_ipx|_og|_og-static-fonts)/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location /images/ {
        expires 30d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # Erst die vorgerenderte Datei, sonst der Node-Server.
    location / {
        try_files $uri $uri.html $uri/index.html @node;
    }

    location @node {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# www und HTTP auf die kanonische Adresse umleiten.
server {
    listen 443 ssl;
    http2 on;
    server_name www.shapeandflow.de;
    ssl_certificate     /etc/letsencrypt/live/shapeandflow.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shapeandflow.de/privkey.pem;
    return 301 https://shapeandflow.de$request_uri;
}

server {
    listen 80;
    server_name shapeandflow.de www.shapeandflow.de;
    return 301 https://shapeandflow.de$request_uri;
}
```

Die `try_files`-Zeile ist der Kern des hybriden Aufbaus: eine vorgerenderte Seite kommt als Datei und
erreicht Node nie, alles Andere geht an Node.

Die Weiterleitung von `www` ist nicht Kosmetik. Ohne sie ist dieselbe Seite unter zwei Adressen
erreichbar, und Google muss raten, welche zählt. Das Zertifikat muss beide Namen abdecken:

```bash
sudo certbot --nginx -d shapeandflow.de -d www.shapeandflow.de
```

## Nach dem Ausrollen prüfen

```bash
curl -sI https://shapeandflow.de/ | head -1                     # 200
curl -s  https://shapeandflow.de/robots.txt                     # Sitemap-Zeile, kein Disallow: /
curl -s  https://shapeandflow.de/sitemap.xml | grep -c "<loc>"  # 11
curl -s  https://shapeandflow.de/llms.txt | head -3
curl -sI https://shapeandflow.de/jeveauxeffect | head -1        # 200, kommt aus der Datei
curl -sI https://www.shapeandflow.de/ | head -1                 # 301
curl -s  https://dev.shapeandflow.de/robots.txt                 # muss Disallow: / enthalten
```

Impressum und Datenschutz stehen absichtlich nicht in der Sitemap: sie sind auf `noindex` gesetzt,
bleiben aber verlinkt und erreichbar.

## Wenn etwas nicht läuft

```bash
sudo systemctl status shapeandflow
sudo journalctl -u shapeandflow -n 50 --no-pager
sudo nginx -t
```

Eine 502 bedeutet fast immer, dass der Node-Prozess nicht läuft oder auf einem anderen Port hört als
im `proxy_pass` steht. Eine 404 auf einer Seite, die es geben müsste, bedeutet meist, dass der Build
nicht durchgelaufen ist und `.output/public/` noch den alten Stand enthält.
