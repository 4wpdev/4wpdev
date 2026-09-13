# WordPress.org plugin map (4WP)

Profile: [profiles.wordpress.org/4wpdev](https://profiles.wordpress.org/4wpdev/)

Catalog: [`plugins.json`](../plugins.json) — refreshed by [`sync-plugins.js`](../sync-plugins.js)

## Published on WordPress.org (11)

| Plugin | Slug | Catalog = W.org Stable |
|--------|------|-------------------------|
| 4WP Account | `4wp-account` | from API |
| 4WP Advanced Code | `4wp-advanced-code` | from API |
| 4WP Drive | `4wp-drive` | from API |
| 4WP FAQ | `4wp-faq` | from API |
| 4WP Notifications | `4wp-notifications` | from API |
| 4WP SEO Helper | `4wp-seo-helper` | from API |
| 4WP Smart Link | `4wp-smart-link` | from API |
| 4WP Style Switcher | `4wp-style-switcher` | from API |
| 4WP TODO | `4wp-todo` | from API |
| 4WP Weather | `4wp-weather` | from API |
| 4WP Booking | `4wp-booking` | from API |

Run sync to refresh versions:

```bash
cd 4wpdev && node sync-plugins.js && node generate-readme.js
```

## Fields

| Field | Meaning |
|-------|---------|
| `version` | Bundle catalog version (W.org Stable if published) |
| `wordpress_org` / `wordpress_org_url` / `wordpress_org_version` | Directory listing |
| `download_url` | W.org ZIP or GitHub archive |
| `github_version` / `github_version_source` | Git HEAD/tag for drift (`header` \| `release` \| `tag`) |
| `inBundle` | Ecosystem / Bundle UI |

## In-plugin marker (roll out gradually)

1. Plugin URI → `https://wordpress.org/plugins/{slug}/`
2. Optional constant `FORWP_*_WPORG_URL`
3. Keep `plugins.json` in sync after each SVN tag
