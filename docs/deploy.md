# Deployment to the Hostinger VPS

Three environments, three containers, one nginx in front. Building happens exclusively in GitHub
Actions; there is not even Node installed on the server.

| Environment | Address                          | Access     | Port (`127.0.0.1` only) | Directory on the server   |
| ----------- | -------------------------------- | ---------- | ----------------------- | ------------------------- |
| production  | `shapeandflow.de` (`www.` → 301) | public     | 8090                    | `/opt/landing/production` |
| stage       | `stage.shapeandflow.de`          | basic auth | 8091                    | `/opt/landing/stage`      |
| dev         | `dev.shapeandflow.de`            | basic auth | 8092                    | `/opt/landing/dev`        |

The booking app sits on the same machine under `buchung.shapeandflow.de` and uses the same
mechanics with ports of its own. The server documentation for it is in `/opt/README.md` on the VPS.

## What deploys when

```
Feature branch ──PR──► fusion ─────────────────► dev
                          │
                          └──PR──► main ────────► stage
                                     │
                                     └─ release-please cuts a release ──► production
```

A merge into `main` deploys stage and lets release-please update a standing release PR in which the
Conventional Commits accumulate. Production only moves once that PR is merged: that is when tag,
GitHub release and CHANGELOG come into being, and the same run deploys. Production is therefore a
deliberate step and not a side effect of a merge — and the version number says what is live.

## How the site is built and served

Hybrid: a Node process runs, but **every page is rendered completely at build time**
(`routeRules: { '/**': { prerender: true } }`). Search engines and AI agents get full HTML without
rendering per request. At runtime the process serves a single route: `POST /api/kontakt` accepts the
contact form and delivers the enquiry over SMTP. It is exempt from the prerender rule
(`'/api/**': { prerender: false }`).

Unlike before, nginx no longer serves any files itself but passes everything through to the
container. Nitro serves the prerendered pages and the precompressed `.br` / `.gz` variants that
`compressPublicAssets` produced at build time. At this site's size the difference against
`try_files` is not measurable, but in exchange there is only one place left where anything is
served, and a rollback swaps an image instead of a directory.

### One image per environment

Prerendering bakes the absolute address into the HTML: canonicals, sitemap, OG images, structured
data, `llms.txt`. An image can therefore **not** travel through the stages. Every environment is
built with its own build arguments:

| Environment | `NUXT_SITE_URL`                 | `NUXT_SITE_ENV` |
| ----------- | ------------------------------- | --------------- |
| production  | `https://shapeandflow.de`       | `production`    |
| stage       | `https://stage.shapeandflow.de` | `staging`       |
| dev         | `https://dev.shapeandflow.de`   | `staging`       |

What follows from that, and what one has to know:

- What is identical between the stages is the **commit**, not the artefact. Whatever was tested on
  stage gets rebuilt for production.
- `NUXT_SITE_ENV=staging` serves `Disallow: /` in the `robots.txt`. The smoke test in the deploy
  checks that in both directions — including that production does _not_ lock itself out.
- On stage and dev the **sitemap is empty**. That is not a fault: `nuxt-sitemap` leaves out routes
  that are set to `noindex`, and with `Disallow: /` that is all of them.
- `nuxt.config.ts` resolves the address once into `siteUrl`. `NUXT_SITE_URL` on its own only reaches
  `nuxt-site-config`; `schemaOrg` and `llms` read the literal from `shared/site.ts` and would
  otherwise still point at the production domain on stage and dev.

The build goes out to the network: `@nuxt/fonts` fetches Playfair Display from Google and stores it
locally, `nuxt-link-checker` checks the internal links. Without egress it fails — so a dead internal
link shows up at build time.

### What that means for feature flags

The flags themselves come from Unleash at runtime, see below. Prerendering has a consequence for
them that one has to know: **the HTML served always contains the fallback**, because at build time
there is no browser SDK yet and nobody to ask. The flag only takes effect once the page has
hydrated in the browser and `unleash-proxy-client` has answered.

For `enable_booking_redirect` that is exactly what is wanted. The fallback is `false`, so the
prerendered HTML never contains a reference to the booking app — not even when the flag is on.
Crawlers and AI agents therefore see the version without the booking path, while visitors get the
button handed to them shortly after loading. For a flag that _hides_ something that is the safe
direction; for one meant to make something visible to search engines it would be the wrong one —
that kind belongs on the build, not in the browser.

The Playwright test `test/buchung-flag.spec.ts` pins this down: no prerendered page may mention the
booking app.

The build is explicitly for `linux/amd64`. `sharp` and the OG renderer put native binaries into the
image, and the VPS is x86_64; an image built on an Apple silicon Mac does not start there.

## Reproducing locally

```bash
docker build \
  --build-arg NUXT_SITE_URL=https://stage.shapeandflow.de \
  --build-arg NUXT_SITE_ENV=staging \
  -t sf-landing:test .

docker run --rm -p 8090:3000 sf-landing:test
curl -s http://127.0.0.1:8090/robots.txt          # Disallow: /
curl -s http://127.0.0.1:8090/ | grep canonical   # stage.shapeandflow.de
```

## Deploying by hand

The regular case is a merge. For a redeploy, a first start or a rollback:

```bash
gh workflow run deploy.yml -f env_name=stage
gh workflow run deploy.yml --ref my-branch -f env_name=dev    # dev from any branch
gh workflow run deploy.yml -f env_name=production -f image_tag=<tag>
```

Dev can be deployed from any branch, stage and production only from `main` — the workflow rejects
anything else before it builds.

`gh workflow run` only works once `deploy.yml` is on `main`: GitHub looks for workflows triggerable
via `workflow_dispatch` on the default branch exclusively, even when a different branch is given
with `--ref`. Before that you get a 404, and the route via a push remains the only one.

### Rollback

The tags are `<commit-sha>-<environment>`. Which ones exist is listed under _Packages_ on the
repository; which one is currently running is on the server:

```bash
ssh robert@186.240.146.22 'cat /opt/landing/production/.env.production'
gh workflow run deploy.yml -f env_name=production -f image_tag=abc1234…-production
```

With `image_tag` set, the build is skipped and the named image gets pulled and started.

## Setting up the server

One-off, with `sudo`. The deploy user deliberately has none: it is meant to be able to start
containers and nothing else.

```bash
ssh-keygen -t ed25519 -C "gha-landing" -f ./landing_deploy -N ""
cp landing_deploy.pub infrastructure/

scp -r infrastructure robert@186.240.146.22:/tmp/landing-infra
ssh -t robert@186.240.146.22 \
  'sudo bash /tmp/landing-infra/provision.sh --deploy-key /tmp/landing-infra/landing_deploy.pub'
```

The script creates `/opt/landing/{production,stage,dev}`, adds the key to
`/home/deploy/.ssh/authorized_keys`, fetches the certificates for stage and dev and installs their
vhosts from `infrastructure/nginx/`. It is repeatable.

It deliberately does **not** touch the production vhost — `shapeandflow.de` keeps serving the static
placeholder, otherwise the domain would sit at 502 until the first prod deploy. After the first
release:

```bash
ssh -t robert@186.240.146.22 'sudo bash /tmp/landing-infra/provision.sh --with-production'
sudo rm -rf /var/www/shapeandflow          # the placeholder, unreferenced now
```

Afterwards delete the private key locally; from then on it exists only as a repository secret.

**Open: HTTP/2.** The vhosts are on `listen 443 ssl;` and therefore only speak HTTP/1.1. The syntax
for switching it on depends on the nginx version, and the wrong one prevents the start:

```bash
ssh robert@186.240.146.22 'nginx -v'
# 1.25.1 or newer → in the server block: http2 on;
# older          → listen 443 ssl http2; (in the [::] line as well)
```

After the change, `sudo nginx -t` before the reload.

### What has to be stored in GitHub

| Place        | Name                         | Value                                             |
| ------------ | ---------------------------- | ------------------------------------------------- |
| Variable     | `DEPLOY_HOST`                | `186.240.146.22`                                  |
| Variable     | `DEPLOY_USER`                | `deploy`                                          |
| Variable     | `SSH_KNOWN_HOSTS`            | output of `ssh-keyscan -t ed25519 186.240.146.22` |
| Secret       | `SSH_PRIVATE_KEY`            | the private half of the key from above            |
| Environments | `dev`, `stage`, `production` | branch policy `main` for stage and production     |

Plus the outgoing mail server for the contact form. The mailboxes are with ALL-INKL, not with the
host of the VPS:

| Place                   | Name              | Value                                                        |
| ----------------------- | ----------------- | ------------------------------------------------------------ |
| Repo variable           | `SMTP_HOST`       | `w021e434.kasserver.com`                                     |
| Repo variable           | `SMTP_PORT`       | `465` (implicit TLS); `587` would be STARTTLS, default `587` |
| Repo variable           | `SMTP_USER`       | `nicht-antworten@shapeandflow.de`                            |
| Secret                  | `SMTP_PASSWORD`   | password of that mailbox                                     |
| Env variable dev, stage | `SMTP_EMPFAENGER` | `test@shapeandflow.de`                                       |
| optional                | `SMTP_ABSENDER`   | overrides `contact.senderEmail` from `shared/site.ts`        |

Host, mailbox and password apply to all three environments, only the recipient differs: environment
variables take precedence over repository variables, so dev and stage write to
`test@shapeandflow.de`, while production has no entry and takes `contact.email`. That way test runs
do not end up in the studio mailbox.

`SMTP_ABSENDER` and `SMTP_EMPFAENGER` are only written by the deploy when they are set: to Nitro an
empty assignment would be a value and would overwrite the addresses from `shared/site.ts` instead of
leaving them open.

The step "Write environment file" sets them as `NUXT_SMTP_*` in `/opt/landing/<env>/.env.<env>`, and
`docker-compose.prod.yml` passes exactly these names on to the container. If they are missing, the
deploy goes through and so does the website: the form then answers with a pointer to the email
address instead of silently swallowing enquiries. The password is in plain text in the env file,
which is why it is written with `umask 077` — the deploy logs the key names only, never the
contents.

#### Unleash feature flags

Unleash runs under `https://unleash.shapeandflow.de`. Every GitHub environment additionally needs
these values:

| Place        | Name                     | Value / scope                                    |
| ------------ | ------------------------ | ------------------------------------------------ |
| Env variable | `UNLEASH_URL`            | `https://unleash.shapeandflow.de`                |
| Env secret   | `UNLEASH_BACKEND_TOKEN`  | backend token for `default` and the environment  |
| Env variable | `UNLEASH_FRONTEND_TOKEN` | frontend token for `default` and the environment |
| Env variable | `UNLEASH_ENVIRONMENT`    | `development` or `production`                    |
| Env variable | `UNLEASH_DEPLOYMENT`     | `dev`, `stage` or `production`                   |

The free OSS edition only provides the built-in environments `development` and `production`. Dev and
stage stay separate nonetheless, because they use tokens of their own and a different `deployment`
context:

| Deployment   | Unleash environment | Context                 |
| ------------ | ------------------- | ----------------------- |
| `dev`        | `development`       | `deployment=dev`        |
| `stage`      | `development`       | `deployment=stage`      |
| `production` | `production`        | `deployment=production` |

From `UNLEASH_URL` the deploy derives the server URL `/api/` and the browser URL `/api/frontend`.
The backend token is treated as a secret and is not even printed in the key-name diagnosis. Frontend
tokens are deliberately public, but read-only and limited to project and environment. If
synchronisation is missing or there is an outage, unknown flags stay `false` by default; the website
and the contact form still start.

The flag itself has to exist as well. There is one at the moment:

| Flag                      | Effect                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `enable_booking_redirect` | On: the website points to the booking app. Off: no button, no notice, no mention in the text. |

If the flag is missing in an environment, it is off there — Unleash answers `false` for unknown
names, and the fallback in the code is the same. So it is enough to create the flag where it is
meant to be on.

Token rotation happens without an interruption: first create a new token in Unleash with the same
project and environment scope, then update the matching GitHub environment and redeploy that
environment only. After a successful smoke test and a visible `seenAt` on the new token, delete the
old token in Unleash. Never copy backend tokens into an issue, a PR, shell history or workflow
output.

`SSH_KNOWN_HOSTS` is deliberately a variable and not a secret: the host key is public information,
and as a secret it would be masked to `***` in exactly those log lines one has to read when SSH
fails.

Check the host key once before entering it. `ssh-keyscan` asks the server over precisely the network
path one does not trust yet; if somebody sits in between, you store their key, and the
`StrictHostKeyChecking yes` in the deploy then only confirms that forgery. Compare it with the
fingerprint from the provider's VPS console (run `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`
there):

```bash
ssh-keyscan -t ed25519 186.240.146.22 | ssh-keygen -lf -
```

Only store the complete `ssh-keyscan` line as `SSH_KNOWN_HOSTS` when the fingerprint matches. If the
key changes later (reinstallation, server move), the same procedure applies — do not adopt the new
output blindly.

On top of that, _Settings → Actions → General_ has to allow Actions to create pull requests —
otherwise release-please cannot open its release PR.

## Checking after a rollout

The deploy checks itself on the server (`/`, `/sitemap.xml`, `/llms.txt`, `/robots.txt` and
indexability appropriate to the environment) and fails when any of that is off. From the outside, in
addition:

```bash
curl -sI https://shapeandflow.de/ | head -1                             # 200
curl -sI https://www.shapeandflow.de/ | head -1                         # 301
curl -s https://shapeandflow.de/robots.txt                              # sitemap line, no Disallow: /
curl -s https://shapeandflow.de/sitemap.xml | grep -o "<loc>" | wc -l   # 11
curl -sI https://shapeandflow.de/jeveauxeffect | head -1                # 200

curl -sI https://stage.shapeandflow.de/ | head -1                       # 401 without credentials
curl -s -u robert:… https://stage.shapeandflow.de/robots.txt            # Disallow: /
```

Impressum and Datenschutz are deliberately absent from the sitemap: they are set to `noindex`, but
stay linked and reachable.

## When something does not work

```bash
ssh robert@186.240.146.22
cd /opt/landing/production
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=200

sudo nginx -t
sudo tail -50 /var/log/nginx/landing_production.error.log
```

- **502** means the container is not running, or is listening on a port other than the one in the
  `upstream`. `docker ps --filter name=sf-landing` shows what is actually running.
- **401 on production** would be an `auth_basic` block copied over by accident.
- **Deploy hangs at `up -d --wait`** means the HEALTHCHECK is not going green. The container's logs
  are in the failed Actions run, which prints them on failure.
- **Certificate expired**: `sudo certbot certificates` shows the remaining lifetimes,
  `sudo certbot renew --dry-run` checks whether renewal works. The most common cause is a
  `/.well-known/acme-challenge/` location that has slipped behind basic auth.
