# Pre-launch security review — 2026-09-19

## Scope
Source review of the static BonsaiQR application, bundled dependency usage, sharing, URL parsing, storage, and external requests. This is not a penetration test or a legal compliance certification. Production Cloudflare settings and response headers have not been verified.

## Fixed
- Shared URLs now use the same HTTP/HTTPS validation and 600-character normalized limit as typed URLs. Credentials and control characters are rejected. Malformed or oversized share payloads fall back safely.
- New share data lives in the URL fragment, avoiding initial server query logs; existing query links remain supported. Encoding is not encryption.
- Share URLs use the current origin instead of the old hosting domain.
- Destination hostname is visible on Visit link. Destinations are not automatically opened or fetched and are not checked for malicious content.
- No-referrer meta/header prevent leaking share state via the Referer header.
- Cloudflare Pages _headers adds CSP, anti-framing, MIME sniffing protection, and restrictions on camera/microphone/location/payment. Inline styles remain allowed for generated colors. Scripts are self-hosted. No eval is permitted.
- Added an application privacy notice and operator contact.

## Cookies and data
The application has no analytics, ads, cookies, localStorage, or server database. QR generation and image downloads are local. Social sharing contacts an external service only when selected. The hosting provider receives ordinary requests and may use security cookies. The existing private Sites deployment may also use authentication cookies; its behavior is not evidence of the future Cloudflare deployment's behavior.

No consent banner has been added. Reassess before adding analytics, advertising, embeds, fingerprinting, or other nonessential device storage/access. Google Analytics was explicitly deferred.

## Before public launch
- Confirm actual Cloudflare response headers, cookies, and network requests in a clean browser session. Verify normal rendering, downloads, sharing, malformed links, and mobile interactions under CSP.
- Leave optional analytics/beacons and third-party script injection off until reviewed. Current CSP intentionally blocks them.
- Confirm hosting log retention and provider terms for the privacy notice. Evaluate applicable laws based on visitors and business scope; US operation alone does not settle global consent requirements.
- Enable MFA on GitHub and Cloudflare, restrict collaborators, and protect main as appropriate.
- Keep vendored Three.js and qrcode-generator updated. No package-manager lockfile is present, so a complete automated dependency advisory audit was not performed.
- Run `node tests/link-safety.mjs` for malicious/malformed URL regression checks.

## Residual risks
Anyone with a share URL can decode the destination; do not encode secrets. QR destinations can be malicious external websites. This app does not provide destination reputation scanning. Public GitHub assets are public, and old shared query URLs can still appear in provider logs. No absolute security or jurisdiction-wide legal guarantee is implied.
