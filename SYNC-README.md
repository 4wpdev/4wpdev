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

### GitHub Token Setup (Recommended)

GitHub API has rate limits: **60 requests/hour** without token and **5000 requests/hour** with token.

#### Step 1: Create GitHub Personal Access Token

1. Go to tokens page: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. Click **"Generate new token"** → **"Generate new token (classic)"**

3. Fill the form:
   - **Note**: `4WP Plugins Sync` (or any name)
   - **Expiration**: choose duration (90 days or No expiration)
   - **Select scopes**: select `public_repo` (sufficient for public repositories)

4. Click **"Generate token"**

5. **Important**: Copy the token immediately (it's shown only once!)
   - Token starts with `ghp_`

#### Step 2: Add Token to .env File

**⚠️ IMPORTANT: Format must be exactly like this:**
```
GITHUB_TOKEN=ghp_your_token_here
```

**NOT just the token without `GITHUB_TOKEN=` at the beginning!**

```bash
cd 4wpdev

# Option 1: Copy example and edit
cp .env.example .env
# Then edit .env and replace ghp_your_token_here with your token

# Option 2: Create manually
echo 'GITHUB_TOKEN=ghp_your_token_here' > .env
# Or edit .env file manually
```

**Example of correct `.env` file format:**
```
GITHUB_TOKEN=ghp_your_token_here
```

#### Step 3: Run Script

Script will automatically read token from `.env` file or environment variable:

```bash
node sync-plugins.js
```

#### Alternative Ways to Set Token

**Option A: Via environment variable (temporary)**
```bash
export GITHUB_TOKEN=ghp_your_token_here
node sync-plugins.js
```

**Option B: Permanently (add to ~/.zshrc)**
```bash
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.zshrc
source ~/.zshrc
```

#### ⚠️ Security

- **DO NOT commit** `.env` file to git
- Keep token secure
- If token is lost, create a new one on GitHub

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

### Error "GitHub API error: 403 - rate limit exceeded"

**Problem**: GitHub API rate limit reached (60 requests/hour without token).

**Solution**:
1. Create GitHub Personal Access Token (see instructions above)
2. Add token to `.env` file: `GITHUB_TOKEN=ghp_your_token`
3. Run script again

**Alternative**: Wait ~1 hour for limit to reset (not recommended).

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
