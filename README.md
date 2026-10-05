# jakebaxendale.com

Jake Baxendale's website: 32 static Astro pages and separate contact and feedback endpoints currently hosted on Vercel.

## Development

Use Node 24 (minimum 22.12) and pnpm 12.9.1, pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Astro serves pages. `pnpm api` runs the Vercel endpoints locally, with a Vercel login and runtime secrets. Never commit credentials.

## Validation

```sh
pnpm check
pnpm fmt:check
pnpm test
deno task check:server
deno task test:server
python3 scripts/audit-links.py --output audit/evidence/local-links.json
```

The suite builds production pages and starts the Deno server on port 14321. It checks all 32 routes at desktop and 320-pixel widths, keyboard navigation, reduced motion, and forms. API and Deno server tests mock MailerSend and never send email. Install Deno to run these checks.

`pnpm test:a11y` runs accessibility checks; `pnpm test:api` runs mocked endpoint tests. Install the browser once with `pnpm exec playwright install chromium`. Third-party player documents are outside the host-page regression scan; iframe titles remain checked. Scores and captions need separate review.

## Build and hosting

```sh
pnpm build
pnpm preview
```

The build writes `dist/` and removes macOS metadata from that output. Vercel headers are in `vercel.json`. The optional Vercel CLI is fetched at a pinned version by `pnpm api` and `pnpm dep:prod`, rather than installed as an application dependency.

The current email endpoints require `MAILERSEND_API_KEY` at runtime. `EMAIL_BLACKLIST` is an optional comma-separated list. Neither is needed by the static build. Recipients remain Jake and the existing developer support copy.

The static build was also verified with Deno 2.9.7:

```sh
deno run -A --node-modules-dir=manual npm:astro@7.3.5 build
node scripts/clean-build.mjs
```

Deno Deploy reads the Git-tracked build/runtime configuration in `deno.json`. It builds static Astro pages and starts `server/main.ts` to serve them and both form endpoints. The server reuses the existing validation and delivery logic and explicitly applies the security headers from `vercel.json`. Run it locally after building:

```sh
deno task serve
```

Staging is the default: every response has `X-Robots-Tag: noindex, nofollow`, HTML is not cached, and valid form submissions reach the failure page without sending. For a controlled delivery test, configure `MAILERSEND_API_KEY` and `MAILERSEND_TEST_RECIPIENT` in the Deno app's relevant runtime context. Test mail goes only to that recipient, omits Jake and the developer copy, and has `[TEST]` in its subject. Never put these values in Git.

At DNS cutover, set `SITE_MODE=production` in the Production runtime context and keep `MAILERSEND_API_KEY` configured there. Production delivery and indexing are enabled only on `jakebaxendale.com` and `www.jakebaxendale.com`; all Deno URLs remain staging even with that setting. Remove the test recipient from Production. The server preserves HTTPS/apex redirects, file ranges, MIME types, missing-page responses, same-host form redirects, and the current request hostname for Twitch embeds.

Keep Vercel's Git integration disconnected during migration so pushes to `main` update Deno while the current Vercel deployment stays live. Do not run `pnpm dep:prod` during this period. The domain registration and email DNS records remain unchanged.

See [the application audit](audit/application-audit.md) for findings, evidence, domain registration details, and the migration plan.
