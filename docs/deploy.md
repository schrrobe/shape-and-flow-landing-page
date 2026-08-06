# Deployment auf den Hostinger VPS

Drei Umgebungen, drei Container, ein nginx davor. Gebaut wird ausschließlich in GitHub Actions;
auf dem Server ist nicht einmal Node installiert.

| Umgebung   | Adresse                          | Zugriff    | Port (nur `127.0.0.1`) | Verzeichnis auf dem Server |
| ---------- | -------------------------------- | ---------- | ---------------------- | -------------------------- |
| production | `shapeandflow.de` (`www.` → 301) | öffentlich | 8090                   | `/opt/landing/production`  |
| stage      | `stage.shapeandflow.de`          | Basic Auth | 8091                   | `/opt/landing/stage`       |
| dev        | `dev.shapeandflow.de`            | Basic Auth | 8092                   | `/opt/landing/dev`         |

Die Booking-App liegt auf derselben Maschine unter `buchung.shapeandflow.de` und benutzt dieselbe
Mechanik mit eigenen Ports. Die Serverdokumentation dazu steht in `/opt/README.md` auf dem VPS.

## Was wann deployt

```
Feature-Branch ──PR──► fusion ─────────────────► dev
                          │
                          └──PR──► main ────────► stage
                                     │
                                     └─ release-please schneidet ein Release ──► production
```

Ein Merge nach `main` deployt stage und lässt release-please eine stehende Release-PR
aktualisieren, in der sich die Conventional Commits sammeln. Produktion bewegt sich erst, wenn
diese PR gemergt wird: dann entstehen Tag, GitHub-Release und CHANGELOG, und derselbe Lauf
deployt.

Damit ist Produktion ein bewusster Schritt und kein Nebeneffekt eines Merges — und die
Versionsnummer sagt, was live steht.

## Wie die Seite gebaut und ausgeliefert wird

Hybrid: es läuft ein Node-Prozess, aber **jede Seite wird beim Build fertig gerendert**
(`routeRules: { '/**': { prerender: true } }`). Suchmaschinen und KI-Agenten bekommen
vollständiges HTML ohne Rendering pro Aufruf. Zur Laufzeit bedient der Prozess nur eine Route:
`POST /api/kontakt` nimmt das Kontaktformular an und stellt die Anfrage per SMTP zu. Sie ist von
der Prerender-Regel ausgenommen (`'/api/**': { prerender: false }`).

Anders als früher liefert nginx keine Dateien mehr selbst aus, sondern reicht alles an den
Container weiter. Nitro liefert die vorgerenderten Seiten und die vorkomprimierten `.br`-/`.gz`-
Varianten aus, die `compressPublicAssets` beim Build erzeugt hat. Der Unterschied gegenüber
`try_files` ist bei dieser Seitengröße nicht messbar, dafür gibt es nur noch einen Ort, an dem
etwas ausgeliefert wird, und ein Rollback tauscht ein Image statt eines Verzeichnisses.

### Ein Image pro Umgebung

Das Prerendern schreibt die absolute Adresse fest ins HTML: Canonicals, Sitemap, OG-Bilder,
Structured Data, `llms.txt`. Ein Image kann deshalb **nicht** durch die Stufen wandern. Jede
Umgebung wird mit eigenen Build-Argumenten gebaut:

| Umgebung   | `NUXT_SITE_URL`                 | `NUXT_SITE_ENV` |
| ---------- | ------------------------------- | --------------- |
| production | `https://shapeandflow.de`       | `production`    |
| stage      | `https://stage.shapeandflow.de` | `staging`       |
| dev        | `https://dev.shapeandflow.de`   | `staging`       |

Was daraus folgt und was man wissen muss:

- Identisch zwischen den Stufen ist der **Commit**, nicht das Artefakt. Was auf stage getestet
  wurde, wird für Produktion neu gebaut.
- `NUXT_SITE_ENV=staging` liefert `Disallow: /` in der `robots.txt`. Der Smoke-Test im Deploy
  prüft das in beide Richtungen — auch, dass Produktion sich _nicht_ aussperrt.
- Auf stage und dev ist die **Sitemap leer**. Das ist kein Fehler: `nuxt-sitemap` lässt Routen
  weg, die auf `noindex` stehen, und das sind bei `Disallow: /` alle.
- `nuxt.config.ts` löst die Adresse einmal in `siteUrl` auf. `NUXT_SITE_URL` allein erreicht nur
  `nuxt-site-config`; `schemaOrg` und `llms` lesen den Literal aus `shared/site.ts` und stünden
  sonst auf stage und dev weiterhin auf der Produktionsdomain.

Der Build geht ins Netz: `@nuxt/fonts` holt Playfair Display bei Google und legt sie lokal ab,
`nuxt-link-checker` prüft die internen Links. Ohne Egress schlägt er fehl — ein toter interner
Link fällt also beim Bauen auf.

Gebaut wird ausdrücklich für `linux/amd64`. `sharp` und der OG-Renderer legen native Binärdateien
ins Image, und der VPS ist x86_64; ein auf einem Apple-Silicon-Mac gebautes Image startet dort
nicht.

## Lokal nachvollziehen

```bash
docker build \
  --build-arg NUXT_SITE_URL=https://stage.shapeandflow.de \
  --build-arg NUXT_SITE_ENV=staging \
  -t sf-landing:test .

docker run --rm -p 8090:3000 sf-landing:test
curl -s http://127.0.0.1:8090/robots.txt          # Disallow: /
curl -s http://127.0.0.1:8090/ | grep canonical   # stage.shapeandflow.de
```

## Deployen von Hand

Der Regelfall ist ein Merge. Für Redeploy, ersten Start oder Rollback:

```bash
gh workflow run deploy.yml -f env_name=stage
gh workflow run deploy.yml --ref mein-branch -f env_name=dev    # dev aus jedem Branch
gh workflow run deploy.yml -f env_name=production -f image_tag=<tag>
```

Dev lässt sich aus jedem Branch deployen, stage und production nur aus `main` — der Workflow
lehnt alles andere ab, bevor er baut.

`gh workflow run` funktioniert erst, wenn `deploy.yml` auf `main` liegt: GitHub sucht per
`workflow_dispatch` auslösbare Workflows ausschließlich auf dem Default-Branch, auch wenn man
mit `--ref` einen anderen Branch angibt. Vorher kommt ein 404, und der Weg über einen Push
bleibt der einzige.

### Rollback

Die Tags sind `<commit-sha>-<umgebung>`. Welche es gibt, steht unter _Packages_ am Repository;
welcher gerade läuft, steht auf dem Server:

```bash
ssh robert@186.240.146.22 'cat /opt/landing/production/.env.production'
gh workflow run deploy.yml -f env_name=production -f image_tag=abc1234…-production
```

Mit gesetztem `image_tag` entfällt der Build und das benannte Image wird gezogen und gestartet.

## Server einrichten

Einmalig, mit `sudo`. Der Deploy-Benutzer hat bewusst keins: er soll Container starten können und
sonst nichts.

```bash
ssh-keygen -t ed25519 -C "gha-landing" -f ./landing_deploy -N ""
cp landing_deploy.pub infrastructure/

scp -r infrastructure robert@186.240.146.22:/tmp/landing-infra
ssh -t robert@186.240.146.22 \
  'sudo bash /tmp/landing-infra/provision.sh --deploy-key /tmp/landing-infra/landing_deploy.pub'
```

Das Skript legt `/opt/landing/{production,stage,dev}` an, ergänzt den Schlüssel in
`/home/deploy/.ssh/authorized_keys`, holt die Zertifikate für stage und dev und spielt deren
Vhosts aus `infrastructure/nginx/` ein. Es ist wiederholbar.

Den Produktions-Vhost fasst es dabei **nicht** an — `shapeandflow.de` liefert weiter den
statischen Platzhalter aus, sonst stünde die Domain bis zum ersten Prod-Deploy auf 502. Nach dem
ersten Release:

```bash
ssh -t robert@186.240.146.22 'sudo bash /tmp/landing-infra/provision.sh --with-production'
sudo rm -rf /var/www/shapeandflow          # der Platzhalter, jetzt unreferenziert
```

Danach den privaten Schlüssel lokal löschen; er liegt ab dann nur noch als Repository-Secret.

**Offen: HTTP/2.** Die Vhosts stehen auf `listen 443 ssl;` und sprechen damit nur HTTP/1.1. Die
Syntax zum Einschalten hängt an der nginx-Version, und die falsche verhindert den Start:

```bash
ssh robert@186.240.146.22 'nginx -v'
# 1.25.1 oder neuer → im server-Block: http2 on;
# älter             → listen 443 ssl http2;  (auch in der [::]-Zeile)
```

Nach der Änderung `sudo nginx -t` vor dem Reload.

### Was in GitHub hinterlegt sein muss

| Ort          | Name                         | Wert                                                |
| ------------ | ---------------------------- | --------------------------------------------------- |
| Variable     | `DEPLOY_HOST`                | `186.240.146.22`                                    |
| Variable     | `DEPLOY_USER`                | `deploy`                                            |
| Variable     | `SSH_KNOWN_HOSTS`            | Ausgabe von `ssh-keyscan -t ed25519 186.240.146.22` |
| Secret       | `SSH_PRIVATE_KEY`            | der private Teil des Schlüssels von oben            |
| Environments | `dev`, `stage`, `production` | für stage und production Branch-Policy `main`       |

Dazu die Zugangsdaten des Postausgangsservers für das Kontaktformular. Sie gehören ins jeweilige
Environment, weil dev und stage sinnvollerweise in ein anderes Postfach schreiben als production:

| Ort                 | Name              | Wert                                                         |
| ------------------- | ----------------- | ------------------------------------------------------------ |
| Variable            | `SMTP_HOST`       | Postausgangsserver des Mail-Providers                        |
| Variable            | `SMTP_PORT`       | `587` (STARTTLS) oder `465` (implizites TLS), Standard `587` |
| Variable            | `SMTP_USER`       | Postfach, über das versandt wird                             |
| Secret              | `SMTP_PASSWORD`   | Kennwort dieses Postfachs                                    |
| Variable (optional) | `SMTP_ABSENDER`   | überschreibt `kontakt.absenderEmail` aus `shared/site.ts`    |
| Variable (optional) | `SMTP_EMPFAENGER` | überschreibt `kontakt.email`, etwa ein Testpostfach für dev  |

Die beiden optionalen schreibt der Deploy nur, wenn sie gesetzt sind: eine leere Zuweisung wäre
für Nitro ein Wert und würde die Adressen aus `shared/site.ts` überschreiben statt offenlassen.

Der Schritt „Umgebungsdatei schreiben" setzt sie als `NUXT_SMTP_*` in `/opt/landing/<env>/.env.<env>`,
und `docker-compose.prod.yml` gibt genau diese Namen an den Container weiter. Fehlen sie, läuft der
Deploy durch und die Website ebenfalls: das Formular antwortet dann mit einem Hinweis auf die
E-Mail-Adresse, statt Anfragen still zu verschlucken. Das Kennwort steht im Klartext in der
env-Datei, die deshalb mit `umask 077` geschrieben wird — der Deploy protokolliert nur die
Schlüsselnamen, nie den Inhalt.

`SSH_KNOWN_HOSTS` ist absichtlich eine Variable und kein Secret: der Hostkey ist öffentliche
Information, als Secret wäre er in genau den Logzeilen zu `***` maskiert, die man bei einem
SSH-Fehler lesen muss.

Den Hostkey vor dem Eintragen einmal gegenprüfen. `ssh-keyscan` fragt den Server über genau den
Netzwerkweg, dem man noch nicht traut; steht dort jemand dazwischen, speichert man dessen
Schlüssel, und das `StrictHostKeyChecking yes` im Deploy bestätigt danach nur noch diese
Fälschung. Vergleichen mit dem Fingerabdruck aus der VPS-Konsole des Providers (dort
`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` ausführen):

```bash
ssh-keyscan -t ed25519 186.240.146.22 | ssh-keygen -lf -
```

Nur bei übereinstimmendem Fingerabdruck die vollständige `ssh-keyscan`-Zeile als
`SSH_KNOWN_HOSTS` speichern. Wechselt der Schlüssel später (Neuinstallation, Serverumzug), gilt
derselbe Ablauf — nicht blind die neue Ausgabe übernehmen.

Zusätzlich muss unter _Settings → Actions → General_ erlaubt sein, dass Actions Pull Requests
anlegen — sonst kann release-please seine Release-PR nicht öffnen.

## Nach dem Ausrollen prüfen

Der Deploy prüft sich selbst auf dem Server (`/`, `/sitemap.xml`, `/llms.txt`, `/robots.txt` und
die Indexierbarkeit passend zur Umgebung) und schlägt fehl, wenn etwas davon nicht stimmt. Von
außen zusätzlich:

```bash
curl -sI https://shapeandflow.de/ | head -1                     # 200
curl -sI https://www.shapeandflow.de/ | head -1                 # 301
curl -s  https://shapeandflow.de/robots.txt                     # Sitemap-Zeile, kein Disallow: /
curl -s  https://shapeandflow.de/sitemap.xml | grep -o "<loc>" | wc -l   # 11
curl -sI https://shapeandflow.de/jeveauxeffect | head -1        # 200

curl -sI https://stage.shapeandflow.de/ | head -1               # 401 ohne Zugangsdaten
curl -s -u robert:… https://stage.shapeandflow.de/robots.txt    # Disallow: /
```

Impressum und Datenschutz stehen absichtlich nicht in der Sitemap: sie sind auf `noindex`
gesetzt, bleiben aber verlinkt und erreichbar.

## Wenn etwas nicht läuft

```bash
ssh robert@186.240.146.22
cd /opt/landing/production
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=200

sudo nginx -t
sudo tail -50 /var/log/nginx/landing_production.error.log
```

- **502** heißt, der Container läuft nicht oder hört auf einem anderen Port als im `upstream`
  steht. `docker ps --filter name=sf-landing` zeigt, was tatsächlich läuft.
- **401 auf Produktion** wäre ein versehentlich kopierter `auth_basic`-Block.
- **Deploy hängt bei `up -d --wait`** heißt, der HEALTHCHECK wird nicht grün. Die Logs des
  Containers stehen im fehlgeschlagenen Actions-Lauf, der sie bei Fehlschlag mit ausgibt.
- **Zertifikat abgelaufen**: `sudo certbot certificates` zeigt die Restlaufzeiten,
  `sudo certbot renew --dry-run` prüft, ob die Verlängerung funktioniert. Häufigste Ursache ist
  eine `/.well-known/acme-challenge/`-Location, die hinter Basic Auth gerutscht ist.
