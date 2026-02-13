# 🔄 4WP Plugins Sync System

Automated plugin synchronization system with GitHub repositories.

## 📋 Features

- ✅ Automatic checking of new releases/tags from GitHub
- ✅ Version change detection (1.1.0 → 1.2.0)
- ✅ Automatic `plugins.json` updates
- ✅ GitHub Topics (labels) support for bundle inclusion
- ✅ GitHub Actions workflow for automatic synchronization

## 🚀 Usage

### Local Run

```bash
# Install Node.js (>=16.0.0)
# Navigate to 4wpdev directory
cd 4wpdev

# Run synchronization
node sync-plugins.js

# Or with npm (from 4wpdev directory)
npm run sync
```

### GitHub Token Setup (Optional)

For better performance and increased rate limit:

```bash
cd 4wpdev
export GITHUB_TOKEN=your_github_token_here
node sync-plugins.js
```

### Minimum Version Change Configuration

By default, any version change triggers an update (1.1.0 → 1.1.1, 1.1.0 → 1.2.0, 1.1.0 → 2.0.0).

To only update minor/major versions:

```bash
MIN_VERSION_CHANGE=minor node sync-plugins.js
```

To only update major versions:

```bash
MIN_VERSION_CHANGE=major node sync-plugins.js
```

## 🏷️ GitHub Topics for Bundle Inclusion

To automatically include a plugin in the bundle, add the `bundle-include` topic to the repository:

1. Go to the repository on GitHub
2. Click "⚙️ Settings"
3. Scroll to "Topics"
4. Add `bundle-include`

The script will automatically detect this topic and set `inBundle: true` in `plugins.json`.

## 📝 plugins.json Structure

After synchronization, plugins may have additional fields:

```json
{
  "name": "4WP Icons",
  "slug": "4wp-icons",
  "version": "0.2.3",
  "inBundle": true,  // Automatically set from GitHub topic
  "download_url": "https://github.com/.../archive/refs/tags/v0.2.3.zip"
}
```

## ⚙️ GitHub Actions

Workflow automatically runs:
- **Daily at 2:00 UTC** (scheduled)
- **Manually** via GitHub Actions UI

Workflow automatically:
1. Checks for new releases
2. Updates `plugins.json`
3. Creates commit with changes

## 🔧 Configuration

Can be changed in `sync-plugins.js`:

```javascript
const CONFIG = {
  bundleLabel: 'bundle-include',  // GitHub topic for bundle
  minVersionChange: 'patch'       // 'patch' (any change), 'minor', 'major'
};
```

## 📊 Version Update Logic

Script updates version only if:
- New version is greater than current
- Change type matches `minVersionChange`:
  - `patch`: 1.1.0 → 1.1.1 ✅, 1.1.0 → 1.2.0 ✅, 1.1.0 → 2.0.0 ✅ (default)
  - `minor`: 1.1.0 → 1.2.0 ✅, 1.1.0 → 2.0.0 ✅
  - `major`: 1.1.0 → 2.0.0 ✅

## 🐛 Troubleshooting

### Error "GitHub API error: 403"
- Add `GITHUB_TOKEN` to increase rate limit

### Error "Could not fetch release"
- Check if releases/tags exist in the repository
- Verify repository URL is correct

### Versions not updating
- Check `minVersionChange` settings
- Ensure new version is greater than current

## 📚 Examples

### Creating a Release on GitHub

```bash
# 1. Update version in plugin file
# 2. Create tag
git tag v1.2.0
git push origin v1.2.0

# 3. Create release on GitHub (via UI or GitHub CLI)
gh release create v1.2.0 --title "v1.2.0" --notes "Release notes"
```

After this, the script will automatically detect the new version on next synchronization.
