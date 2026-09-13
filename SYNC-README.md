# 🔄 4WP Plugins Sync System

Keeps [`plugins.json`](plugins.json) current from:

1. **WordPress.org** Plugins API — Stable tag + download ZIP (`wordpress_org: true`)
2. **GitHub** — highest of plugin header on default branch / latest release / tags

Catalog `version` for published plugins = **directory Stable** (what Bundle installs).  
`github_version` is stored for drift (git ahead or tags lagging SVN).

## Usage

```bash
cd 4wpdev
# optional: GITHUB_TOKEN in .env or `gh auth`
node sync-plugins.js
node generate-readme.js
```

Or: `npm run sync` then regenerate README.

## GitHub Actions

[`.github/workflows/sync-plugins.yml`](.github/workflows/sync-plugins.yml) — daily + manual.

## Notes

- Stale GitHub tags are common when releases go to wordpress.org SVN; header on `main` is preferred over a lower tag.
- Profile of published plugins: https://profiles.wordpress.org/4wpdev/
- Map: [`docs/wordpress-org-plugins.md`](docs/wordpress-org-plugins.md)
