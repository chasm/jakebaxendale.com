# Jake Baxendale application audit and Deno migration

Audited on 5 October 2026 against this repository and https://jakebaxendale.com/. The published pages load, and the repaired application passes its build, type, lint, formatting, and browser checks. **The production site on Vercel remains unchanged.** The repository now includes a Deno server for static pages, form endpoints, security headers, and staging isolation. Validate its hosted deployment and controlled email delivery before DNS cutover.

This audit combines source review, automated accessibility tests, public HTTP checks, and visual samples. It is not WCAG certification: third-party players, score documents, captions, screen-reader behavior, and actual email delivery have separate limitations.

## Domain registration and DNS

The authenticated Vercel CLI confirms that **the domain is registered and managed through Vercel under the `codewrights` team**. Its project is `jakebaxendale-com`, covering both apex and `www` domains. Vercel reports `Registrar: Vercel`; the public registry identifies **Name.com, Inc., IANA registrar 625**, Vercel's upstream registrar. Manage renewal and transfer through the Vercel team, rather than assuming a standalone Name.com account. [Vercel registration documentation](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain), [registry record](https://rdap.verisign.com/com/v1/domain/jakebaxendale.com).

- Expiry: **8 February 2027 at 11:22 NZDT**, equivalent to 7 February at 22:22 UTC. Auto-renewal and payment details were not verified.
- Nameservers: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.
- Transfer status: locked against registrar transfer; DNSSEC delegation is unsigned. Moving hosting does not require unlocking or transferring registration.
- HTTP and `www` requests redirect to the HTTPS apex. Missing pages return 404.

The authenticated DNS listing includes these email records alongside Vercel's default website ALIAS and CAA records:

| Name                | Type  | Value or purpose                                                   |
| ------------------- | ----- | ------------------------------------------------------------------ |
| Apex                | MX    | `10 mx1.improvmx.com.` and `20 mx2.improvmx.com.`                  |
| Apex                | TXT   | `v=spf1 include:_spf.mailersend.net include:spf.improvmx.com ~all` |
| `mta`               | CNAME | `mailersend.net.`                                                  |
| `mlsend._domainkey` | TXT   | MailerSend DKIM public key                                         |

Preserve all four configurations to protect inbound forwarding and outbound email authentication. Full values are saved in [dns-zone.txt](evidence/dns-zone.txt). No DMARC TXT record was found; review forwarding and alignment before selecting a policy. Registration evidence is in [registration.json](evidence/registration.json) and [vercel-registration.txt](evidence/vercel-registration.txt).

## Confirmed defects repaired locally

| Area                        | Finding and repair                                                                                                                                                                                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email delivery              | The original MailerSend payload used an array for `reply_to`; its API expects one object. Corrected the schema and optional-name handling. [MailerSend API](https://developers.mailersend.com/api/v1/email).                                                                            |
| Form validation             | Added POST-only handling, string validation, field limits, normalized input, no-store responses, and controlled failure handling for missing secrets and network errors. Prevented the other form's message field from overriding the intended submission.                              |
| Email safety                | Escaped user text in HTML email, added plain text, set a delivery timeout, and disabled provider tracking.                                                                                                                                                                              |
| Mobile menu                 | Fixed keyboard activation, focusable hidden links, and the missing toggle between 1201 and 1240 pixels. The native checkbox supports Space and Enter; Escape closes it; background content becomes inert while open.                                                                    |
| Focus and contrast          | Mobile skip links were hidden when focused. They are visible now, and targets receive focus. Strengthened field borders, focus outlines, gallery controls, and card focus indicators.                                                                                                   |
| Gallery                     | Respects reduced motion, pauses during navigation and touch interaction, keeps full-size images keyboard accessible, supports arrow keys from the track, and provides 24-pixel dots with current-state semantics. Fixed native button activation and stale state updates.               |
| Embeds and reflow           | Added three missing iframe titles, constrained Bandcamp players to the page width, and darkened their link color. Hidden navigation no longer creates horizontal overflow.                                                                                                              |
| Assets                      | Added two missing Striking Moments JPEG variants from existing matching JPEGs. Built links, assets, and fragment targets now resolve locally.                                                                                                                                           |
| External references         | Repaired three Humanitix ticket links, Rātā Big Band/music links, Rogue and Vagabond links, and Black String's link using verified destinations. Corrected Gardening Music's contradictory discography year.                                                                            |
| Metadata                    | Added favicon and Open Graph title, URL, and type; marked the current navigation item; added column scopes; removed misleading build-time sitemap modification dates.                                                                                                                   |
| Privacy statements          | Disclosed the existing developer email copy and potential mailbox retention, and added Bandcamp and third-party player disclosures. The host remains named as Vercel until cutover.                                                                                                     |
| Dependencies and repository | Upgraded Astro to 7.3.5 and other dependencies, aligned Node requirements, added template checking, fixed type/CSS errors, and removed unused MDX, redundant Vite, and the Vercel CLI/type dependency tree. Generated caches are ignored and untracked; builds strip `.DS_Store` files. |
| Tests and operations        | Fixed two stale assertions, added endpoint and interaction regressions, checked iframe titles instead of excluding their elements, repaired the broken deploy script, and tested freshly built production pages on an isolated port.                                                    |

The local Vercel headers retain CSP, HSTS, frame denial, and MIME protection, with added `base-uri`, `object-src`, `form-action`, `frame-ancestors`, and referrer policy. Obsolete X-XSS-Protection was removed.

## Validation results

| Check                        | Result                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Node production build        | 32 pages built successfully                                                                                  |
| Deno production build        | Successful with Deno 2.9.7                                                                                   |
| Astro, TypeScript, and CSS   | Passed with no diagnostics                                                                                   |
| Formatting and whitespace    | Passed                                                                                                       |
| Browser suite                | **157 passed**, no skips or flaky results                                                                    |
| Host accessibility           | All 32 routes passed selected WCAG 2.2 AA axe rules at desktop and 320-pixel widths                          |
| Reflow                       | All 32 routes passed the check for page-level horizontal overflow                                            |
| Endpoints                    | Six mocked tests cover payloads, anonymous feedback, validation, honeypots, blacklist, and delivery failures |
| Built references             | 32 documents; no missing local links, assets, or fragments                                                   |
| Published pages              | All 32 returned HTTP 200                                                                                     |
| Public crawl                 | 886 unique URLs checked, including 116 external URLs                                                         |
| Public media                 | Sample PDF and MP3 range requests returned 206 with correct MIME types                                       |
| Public endpoint GET requests | Both currently return 500; local handlers now return 405 with `Allow: POST`                                  |

Saved results: [verification summary](evidence/verification.json), [dependency audit](evidence/dependency-audit.json), and [built reference check](evidence/local-links.json).

The original suite passed 111 of 113 tests. Dependency findings fell from 145, including two critical findings, to **one high advisory in `braces@3.0.3`**, used by Stylelint's development glob tooling. The registry reports no published fix. This application supplies fixed globs, and the library is not used by static pages or email handlers. The dependency scan intentionally remains failing rather than hiding the advisory. [Braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

The critical Astro advisory concerned processing untrusted AVIF images. The existing static deployment has no Astro image-optimization endpoint, but the vulnerable build dependency was upgraded regardless. [Astro advisory](https://github.com/advisories/GHSA-26w7-cxv4-gfx2).

## Remaining issues and verification limits

1. **Keep production separate from migration testing.** The current Vercel version retains the original defects. No DNS change, valid live email submission, or registrar transfer was performed during the audit and server preparation. Vercel's Git integration was disconnected by the site owner before updating GitHub for Deno.
2. **Verify actual email delivery on staging.** Mocks do not establish that credentials, sender approval, quota, forwarding, or inbox delivery work. Perform a controlled approved delivery check before cutover. Consider a distributed rate limit: honeypots and a blacklist do not prevent repeated submissions.
3. **Update stale announcements.** The home page still presents April 2026 dates as upcoming. Gardening Music retains July 2025 release-announcement wording. Archive or refresh these with Jake's current content; replacement concert dates were not invented.
4. **Resolve remaining external references.** Cave Circles' `tuone-found-in-translation` album URL returns 404 with no verified replacement. Places NZ and the Auckland thesis endpoint could not be verified. Discogs and Plonk returned 403 to automated requests and are unverified, rather than confirmed broken. One timed-out local image was rechecked successfully. [Crawl evidence](evidence/live-links.json), [follow-up probes](evidence/live-probes.json).
5. **Third-party media still needs accessibility review.** The expanded scan found ARIA errors inside YouTube player documents. Host regression tests now check the host and iframe titles separately. Caption completeness, transcripts, Twitch archive availability, and full assistive technology interaction were not verified. Bandcamp's configurable link contrast was corrected locally.
6. **All five score PDFs are untagged**, totaling 49 pages. Four have empty title metadata; one uses a legacy `.mus` filename as its title. A visual sample renders legibly, but these files do not establish accessible reading order or musical semantics. Obtain tagged documents and suitable MusicXML, Braille music, or other alternatives from the original score sources. [Score metadata](evidence/score-accessibility.json).
7. **Review assets and ongoing checks.** The public library is approximately 316 MiB; about 173 MiB was not directly referenced by the live HTML crawl. CSS, shared URLs, and other workflows can still use these files, so they were retained. There is no existing CI workflow. Production field performance data, Safari/Firefox testing, and screen-reader testing were unavailable. Representative Chromium screenshots were visually inspected.

## Follow-up: initial Deno preview

Jake's Deno account now has a GitHub-backed preview at https://jakebaxendalecom-c2ej7pznvqwt.jbmusic.deno.net/. Read-only checks on 5 October confirmed that all 32 page routes return HTTP 200. Sample CSS, scripts, and an icon load; PDF and MP3 byte ranges return 206. Missing pages return 404, and `/contact` redirects to `/contact/` on the preview hostname. A homepage HEAD request returned 405; the migrated server should support HEAD.

This preview uses the existing committed GitHub source, so the local audit fixes are still absent. Both `/api/contact` and `/api/feedback` return 404, and the two previously missing JPEG variants remain missing. Three iframe titles remain absent. The Twitch iframe allows the production hostname and `www.example.com`, but not this preview hostname. The homepage response lacks the Vercel security headers and permits search indexing; add staging `X-Robots-Tag: noindex` protection. No email submission or DNS change was made. [Preview HTTP evidence](evidence/deno-preview-smoke.json).

### Deno runtime prepared after that baseline

`deno.json` now explicitly runs pinned JavaScript-based pnpm 10.32.1 through Deno for the locked install, runs the Astro build/cleanup through Deno, and specifies the dynamic `server/main.ts` entrypoint. The server serves the static output through Deno's standard HTTP library and adapts Web Requests/Responses to the shared form validation and MailerSend delivery logic. It bounds request bodies, rejects duplicate URL-encoded fields, keeps form redirects on the request host, applies the security headers, supports HEAD and media ranges, prevents directory listings, and sets Twitch's parent to the current hostname.

Every Deno hostname remains staging: HTML is not cached, all responses have `X-Robots-Tag: noindex, nofollow`, and mail is disabled unless a test recipient is explicitly configured. Test delivery omits Jake and the developer BCC and prefixes the subject with `[TEST]`. Enabling production requires both `SITE_MODE=production` and the canonical custom hostname. No secrets are committed.

Seven native Deno tests cover these behaviors with delivery mocked. The browser suite now runs against the Deno server and includes real form transport to the disabled-mail failure page. Host smoke tests stub third-party iframe documents while checking first-party asset responses and all host console errors; player availability is reviewed separately. A Twitch probe produced provider-side 429 and permissions-policy errors, so playback still needs manual review.

The updated suite passed **159 browser/API tests and seven native Deno tests**, with no failures or flaky results. Both Node and Deno static builds, server types, Astro/TypeScript/CSS checks, formatting, and built references passed. [Staging verification](evidence/staging-verification.json).

The first hosted update failed at the platform pnpm install step. An isolated reproduction showed that pnpm 10 cannot read pnpm 12's multi-document lockfile. The lockfile was converted to one application document without changing any application dependency version, and a pinned pnpm 10 install passed under Deno.

Use the stable app URL, https://jakebaxendalecom.jbmusic.deno.net/, to follow deployments of `main`; the original revision URL remains a snapshot. Both URLs are test hosts until custom-domain cutover.

## Deno Deploy migration plan

Use current Deno Deploy at `console.deno.com`, rather than Deploy Classic. Integrated builds support static and dynamic runtimes. The local build test confirms source compatibility, not a hosted deployment. [Deno builds](https://docs.deno.com/deploy/reference/builds/), [migration guide](https://docs.deno.com/deploy/migration_guide/).

1. **Keep static Astro pages.** Use the locked install and production build. Disable SPA fallback so missing routes return 404.
2. **Verify the implemented email endpoints remotely.** `server/forms.ts` now handles Web Requests/Responses for `/api/contact` and `/api/feedback`, reusing shared validation. `server/main.ts` serves `dist/` alongside them. Ensure Deno uses the Git-tracked dynamic runtime configuration rather than its initial static configuration.
3. **Configure runtime secrets.** Copy `MAILERSEND_API_KEY` and optional `EMAIL_BLACKLIST` into Deno's appropriate environments. Preserve verified sender and recipients; the static build needs neither secret.
4. **Verify implemented hosting behavior.** The custom server explicitly applies the security headers from `vercel.json`; Deno does not interpret that file automatically. Validate security/cache headers, HTTPS and `www` redirects, trailing-slash behavior, 404s, MIME types, PDF/MP3 ranges, no-store form responses, and Twitch's runtime hostname replacement on the hosted app.
5. **Validate staging before routing users there.** Repeat browser, accessibility, asset, header, redirect, and range checks, and the controlled email delivery check. Set `SITE_MODE=production` in the Production runtime context when ready for cutover; Deno hostnames will continue using staging behavior. Update the privacy policy's hosting statement at cutover.
6. **Add both custom domains and provision TLS.** Use the exact verification and routing records supplied by Deno. The apex already has MX/TXT records, so use supported A or ALIAS routing, not a conflicting ordinary apex CNAME. Existing CAA permits Let's Encrypt. [Deno domains](https://docs.deno.com/deploy/reference/domains/).
7. **Change website routing while preserving email and renewal.** Registration and DNS may remain at Vercel while hosting moves to Deno. If moving DNS too, reproduce the complete saved zone first, including DKIM and `mta`. Preserve prior routing and the Vercel deployment for rollback.
8. **Retire hosting separately from registration.** Observe the new site before removing its old hosting project. Keep the Vercel domain/team active for renewal unless a separate registrar transfer is deliberately completed.

Vercel Hobby permits non-commercial personal use. Paid lessons and album/ticket promotion make this site appear commercial; that is an inference from the content, rather than an account determination. Moving hosting addresses that concern without requiring registrar transfer. [Vercel Hobby](https://vercel.com/docs/plans/hobby).

Deno's published Free allowances include 1 million monthly requests, 20 GiB egress, and five custom domains. Compare actual usage, particularly media downloads, before selecting a plan; repository size is not monthly bandwidth. Pro is listed at US$20/month. [Deno pricing](https://deno.com/deploy/pricing).

## Whitespace regression correction — 5 October 2026

The initial audit upgraded Astro 5 to Astro 7 without explicitly preserving the previous whitespace behavior. Astro 7 defaults to JSX whitespace rules, which remove line breaks beside inline elements. This joined words around links and emphasis on several pages; the existing page-loading and accessibility tests did not detect it. Comparing the unchanged biography on Vercel confirmed this was a regression in the new build.

The site now explicitly uses `compressHTML: true`, preserving the previous HTML-aware behavior as recommended in the [Astro 7 migration guide](https://docs.astro.build/en/guides/upgrade-to/v7/#new-default-whitespace-handling-compresshtml-jsx). A comparison of all 31 currently public pages checked 165 static text blocks: 39 differed before the configuration fix and none differed after it. One separate missing source space after “no audition required.” on Lessons was also corrected.

The browser suite now compares authored static prose, captions and lists with browser-rendered text on every route, including card prose. Player fallback documents and dynamic expressions remain covered by their separate checks. A deliberate temporary reintroduction of the faulty compiler setting made the biography regression test fail; restoring the setting made all 31 spacing tests pass. Venues source is preserved in `archive/pages/venues/index.astro` and is no longer a public route.

Final validation passed **184 browser tests**, with no failures, skips or flaky results, plus Astro/TypeScript and formatting checks. [Whitespace verification](evidence/text-spacing-verification.json).
