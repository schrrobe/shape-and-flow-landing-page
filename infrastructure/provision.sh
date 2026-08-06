#!/usr/bin/env bash
#
# Einmalige Einrichtung der Landingpage-Umgebungen auf dem VPS.
#
# Muss als root laufen, weil es nach /opt, /etc/nginx und /home/deploy schreibt und certbot
# aufruft. Der Deploy-Benutzer, den GitHub Actions später verwendet, hat bewusst kein sudo:
# er soll Container starten können und sonst nichts.
#
# Aufruf vom Arbeitsrechner aus:
#
#     scp -r infrastructure robert@186.240.146.22:/tmp/landing-infra
#     ssh -t robert@186.240.146.22 \
#       'sudo bash /tmp/landing-infra/provision.sh --deploy-key /tmp/landing-infra/landing_deploy.pub'
#
# Der Lauf ist wiederholbar: vorhandene Verzeichnisse, Schlüssel und Zertifikate werden erkannt
# und übersprungen.
#
# Der Produktions-Vhost wird standardmäßig *nicht* angefasst. shapeandflow.de liefert bis dahin
# weiter den statischen Platzhalter aus; würde dieses Skript sofort auf den Container
# umschalten, stünde die Domain bis zum ersten grünen Prod-Deploy auf 502. Nach dem ersten
# Release also ein zweites Mal laufen lassen:
#
#     sudo bash /tmp/landing-infra/provision.sh --with-production

set -euo pipefail

DEPLOY_USER=deploy
COMPOSE_ROOT=/opt/landing
NGINX_AVAILABLE=/etc/nginx/sites-available
NGINX_ENABLED=/etc/nginx/sites-enabled
CERTBOT_WEBROOT=/var/www/certbot
HTPASSWD=/etc/nginx/.htpasswd

# Hostnamen, für die dieses Skript ein Zertifikat besorgt. Produktion ist nicht dabei: das
# Zertifikat für shapeandflow.de und www. existiert seit der Grundeinrichtung des Servers.
BOOTSTRAP_HOSTS=(stage.shapeandflow.de dev.shapeandflow.de)

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
NGINX_SRC="$SCRIPT_DIR/nginx"

DEPLOY_KEY_FILE=""
WITH_PRODUCTION=0
CERTBOT_EMAIL=""

usage() {
  cat >&2 <<'USAGE'
Aufruf: provision.sh [--deploy-key <pfad-zu-pubkey>] [--email <adresse>] [--with-production]

  --deploy-key       Öffentlicher Schlüssel, der in /home/deploy/.ssh/authorized_keys ergänzt
                     wird. Ohne Angabe bleibt authorized_keys unberührt.
  --email            Kontaktadresse für Let's Encrypt. Ohne Angabe wird --register-unsafely-
                     without-email verwendet, dann gibt es keine Warnung vor Ablauf.
  --with-production  Schaltet shapeandflow.de vom statischen Platzhalter auf den Container um.
                     Erst nach dem ersten erfolgreichen Prod-Deploy sinnvoll.
USAGE
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    --deploy-key) DEPLOY_KEY_FILE=${2:?--deploy-key braucht einen Pfad}; shift 2 ;;
    --email) CERTBOT_EMAIL=${2:?--email braucht eine Adresse}; shift 2 ;;
    --with-production) WITH_PRODUCTION=1; shift ;;
    -h | --help) usage ;;
    *) echo "Unbekanntes Argument: $1" >&2; usage ;;
  esac
done

if [ "$(id -u)" -ne 0 ]; then
  echo "Muss als root laufen (sudo bash $0 …)." >&2
  exit 1
fi

say() { printf '\n==> %s\n' "$*"; }

# ── Voraussetzungen ─────────────────────────────────────────────────────────
#
# Lieber hier abbrechen als auf halbem Weg. Ein Lauf, der die Verzeichnisse anlegt und dann an
# einem fehlenden certbot scheitert, hinterlässt einen Zustand, den niemand mehr überblickt.

say "Voraussetzungen prüfen"

for cmd in nginx certbot docker install; do
  command -v "$cmd" >/dev/null || { echo "$cmd nicht gefunden." >&2; exit 1; }
done

id "$DEPLOY_USER" >/dev/null 2>&1 || { echo "Benutzer $DEPLOY_USER existiert nicht." >&2; exit 1; }
id -nG "$DEPLOY_USER" | tr ' ' '\n' | grep -qx docker \
  || { echo "$DEPLOY_USER ist nicht in der Gruppe docker." >&2; exit 1; }
[ -d "$CERTBOT_WEBROOT" ] || { echo "$CERTBOT_WEBROOT fehlt." >&2; exit 1; }
[ -f "$HTPASSWD" ] || { echo "$HTPASSWD fehlt — Basic Auth für stage/dev wäre wirkungslos." >&2; exit 1; }
[ -d "$NGINX_SRC" ] || { echo "$NGINX_SRC fehlt — das ganze infrastructure/ kopieren." >&2; exit 1; }

echo "ok"

# ── Compose-Verzeichnisse ───────────────────────────────────────────────────
#
# Hierhin legt der Deploy-Workflow docker-compose.prod.yml und .env.<env>. Die env-Datei
# enthält keine Geheimnisse, aber 750 kostet nichts und entspricht /opt/booking.

say "Compose-Verzeichnisse unter $COMPOSE_ROOT"

install -d -o root -g root -m 755 "$COMPOSE_ROOT"
for env_name in production stage dev; do
  install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 750 "$COMPOSE_ROOT/$env_name"
  echo "  $COMPOSE_ROOT/$env_name"
done

# ── Deploy-Schlüssel ────────────────────────────────────────────────────────

if [ -n "$DEPLOY_KEY_FILE" ]; then
  say "Deploy-Schlüssel in authorized_keys ergänzen"

  [ -f "$DEPLOY_KEY_FILE" ] || { echo "$DEPLOY_KEY_FILE nicht gefunden." >&2; exit 1; }

  deploy_home=$(getent passwd "$DEPLOY_USER" | cut -d: -f6)
  authorized="$deploy_home/.ssh/authorized_keys"

  install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 700 "$deploy_home/.ssh"
  [ -f "$authorized" ] || install -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 600 /dev/null "$authorized"

  # Vergleich über den Schlüsselteil, nicht über die ganze Zeile: der Kommentar am Ende
  # unterscheidet sich zwischen Rechnern, und ein zweiter Eintrag desselben Schlüssels wäre
  # nicht falsch, aber verwirrend.
  key_material=$(awk '{print $2}' "$DEPLOY_KEY_FILE")
  if awk '{print $2}' "$authorized" | grep -qxF "$key_material"; then
    echo "  bereits vorhanden, nichts zu tun"
  else
    cat "$DEPLOY_KEY_FILE" >> "$authorized"
    echo "  ergänzt"
  fi

  chown "$DEPLOY_USER:$DEPLOY_USER" "$authorized"
  chmod 600 "$authorized"
else
  say "Kein --deploy-key angegeben, authorized_keys bleibt unberührt"
fi

# ── Zertifikate für stage und dev ───────────────────────────────────────────
#
# Henne und Ei: der fertige Vhost verweist auf Zertifikatsdateien, die es noch nicht gibt, und
# `nginx -t` scheitert daran. Deshalb erst ein Vhost, der nur :80 bedient und die
# acme-challenge beantwortet, dann das Zertifikat, dann der richtige Vhost.

for host in "${BOOTSTRAP_HOSTS[@]}"; do
  if [ -d "/etc/letsencrypt/live/$host" ]; then
    say "Zertifikat für $host existiert bereits"
    continue
  fi

  say "Zertifikat für $host besorgen"

  resolved=$(getent ahostsv4 "$host" | awk 'NR==1 {print $1}')
  echo "  $host löst auf $resolved auf"

  cat > "$NGINX_AVAILABLE/$host" <<EOF
# Übergangsweise: beantwortet nur die acme-challenge. provision.sh ersetzt diese Datei durch
# den richtigen Vhost, sobald das Zertifikat da ist.
server {
  listen 80;
  listen [::]:80;
  server_name $host;

  location /.well-known/acme-challenge/ {
    root $CERTBOT_WEBROOT;
  }

  location / {
    return 503;
  }
}
EOF

  ln -sfn "$NGINX_AVAILABLE/$host" "$NGINX_ENABLED/$host"
  nginx -t
  systemctl reload nginx

  if [ -n "$CERTBOT_EMAIL" ]; then
    certbot certonly --webroot -w "$CERTBOT_WEBROOT" -d "$host" \
      --non-interactive --agree-tos --email "$CERTBOT_EMAIL"
  else
    certbot certonly --webroot -w "$CERTBOT_WEBROOT" -d "$host" \
      --non-interactive --agree-tos --register-unsafely-without-email
  fi
done

# ── Vhosts ──────────────────────────────────────────────────────────────────

install_vhost() {
  local host=$1
  say "Vhost $host"

  # Die vorherige Fassung aufheben, solange sie noch existiert. Nach einem `nginx -t`, das
  # fehlschlägt, will man die alte Datei zurück und nicht aus dem Gedächtnis rekonstruieren.
  if [ -f "$NGINX_AVAILABLE/$host" ] && ! cmp -s "$NGINX_SRC/$host.conf" "$NGINX_AVAILABLE/$host"; then
    cp -a "$NGINX_AVAILABLE/$host" "$NGINX_AVAILABLE/$host.bak"
    echo "  vorherige Fassung nach $NGINX_AVAILABLE/$host.bak gesichert"
  fi

  install -o root -g root -m 644 "$NGINX_SRC/$host.conf" "$NGINX_AVAILABLE/$host"
  ln -sfn "$NGINX_AVAILABLE/$host" "$NGINX_ENABLED/$host"
  echo "  eingespielt und aktiviert"
}

for host in "${BOOTSTRAP_HOSTS[@]}"; do
  install_vhost "$host"
done

if [ "$WITH_PRODUCTION" -eq 1 ]; then
  install_vhost shapeandflow.de
else
  say "Produktions-Vhost übersprungen"
  echo "  shapeandflow.de liefert weiter den Platzhalter aus /var/www/shapeandflow."
  echo "  Nach dem ersten erfolgreichen Prod-Deploy: $0 --with-production"
fi

say "nginx prüfen und neu laden"
nginx -t
systemctl reload nginx

say "Fertig"
cat <<'NEXT'

Nächste Schritte:

  1. In GitHub die Variablen DEPLOY_HOST, DEPLOY_USER und SSH_KNOWN_HOSTS sowie das Secret
     SSH_PRIVATE_KEY hinterlegen, dazu die Environments dev, stage und production.
  2. Auf `fusion` pushen — das deployt dev. Erreichbar unter https://dev.shapeandflow.de
     hinter Basic Auth (Benutzer aus /etc/nginx/.htpasswd).
  3. Nach main mergen — das deployt stage und öffnet die erste Release-PR.
  4. Release-PR mergen — das deployt production. Danach dieses Skript ein zweites Mal mit
     --with-production laufen lassen und /var/www/shapeandflow/index.html entfernen.

Einzelheiten in docs/deploy.md.
NEXT
