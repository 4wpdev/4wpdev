# 🚀 Quick Start - Plugin Synchronization

## What Was Created

✅ **Node.js sync script** (`sync-plugins.js`)
- Automatically checks GitHub releases/tags
- Detects version changes (1.1.0 → 1.2.0)
- Updates `plugins.json`

✅ **GitHub Actions workflow** (`.github/workflows/sync-plugins.yml`)
- Automatic daily run
- Manual run capability

✅ **GitHub Topics Support**
- Add `bundle-include` topic to repository
- Plugin automatically gets `inBundle: true`

## How to Use

### 1. Local Test

```bash
cd 4wpdev
node sync-plugins.js
```

### 2. GitHub Token Setup (Recommended)

```bash
cd 4wpdev
export GITHUB_TOKEN=ghp_your_token_here
node sync-plugins.js
```

### 3. Adding Plugin to Bundle

1. Go to repository on GitHub
2. Settings → Topics
3. Add: `bundle-include`
4. Run synchronization

### 4. Creating New Release

```bash
# In plugin repository
git tag v1.2.0
git push origin v1.2.0

# Create release on GitHub (via UI or CLI)
gh release create v1.2.0 --title "v1.2.0"
```

After this, synchronization will automatically detect the new version!

## Update Logic

Script updates version only if:
- ✅ New version > current
- ✅ Change matches `minVersionChange` (default: `patch` - any version change)

**Examples (default - patch):**
- `1.1.0 → 1.1.1` (patch) - ✅ updated
- `1.1.0 → 1.2.0` (minor) - ✅ updated
- `1.1.0 → 2.0.0` (major) - ✅ updated

To only update minor/major versions:
```bash
cd 4wpdev
MIN_VERSION_CHANGE=minor node sync-plugins.js
```

## GitHub Actions

Workflow automatically:
- 🔄 Runs daily at 2:00 UTC
- 📝 Updates `plugins.json` on changes
- 💾 Creates commit with changes

Can be run manually via GitHub Actions UI.

## Structure After Synchronization

```json
{
  "name": "4WP Icons",
  "version": "0.2.3",
  "inBundle": true,  // ← Automatically from GitHub topic
  "download_url": "https://github.com/.../archive/v0.2.3.zip"
}
```

## Troubleshooting

**403 error?** → Add `GITHUB_TOKEN`

**Versions not updating?** → Check `minVersionChange` settings

**No releases?** → Create tag or release on GitHub

---

More details: see [SYNC-README.md](SYNC-README.md)
