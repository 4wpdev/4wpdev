#!/usr/bin/env node

/**
 * 4WP Plugins Sync Script
 * 
 * Synchronizes plugins.json with GitHub repositories:
 * - Checks latest releases/tags from GitHub
 * - Detects version changes (1.1.0 -> 1.2.0)
 * - Automatically updates plugins.json
 * - Supports GitHub labels for bundle inclusion
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  pluginsJsonPath: path.join(__dirname, 'plugins.json'),
  githubApiBase: 'https://api.github.com',
  githubToken: process.env.GITHUB_TOKEN || '',
  // Label for automatic bundle inclusion
  bundleLabel: 'bundle-include',
  // Minimum version change for update (patch: any version change like 1.1.0 -> 1.1.1, 1.1.0 -> 1.2.0, etc.)
  minVersionChange: 'patch' // 'patch', 'minor', 'major'
};

/**
 * Compares two versions using semver
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  
  return 0;
}

/**
 * Determines version change type (patch, minor, major)
 */
function getVersionChangeType(oldVersion, newVersion) {
  const oldParts = oldVersion.split('.').map(Number);
  const newParts = newVersion.split('.').map(Number);
  
  if (newParts[0] > oldParts[0]) return 'major';
  if (newParts[1] > oldParts[1]) return 'minor';
  if (newParts[2] > oldParts[2]) return 'patch';
  
  return null;
}

/**
 * Checks if version should be updated
 */
function shouldUpdateVersion(oldVersion, newVersion) {
  if (!oldVersion || !newVersion) return false;
  if (compareVersions(newVersion, oldVersion) <= 0) return false;
  
  const changeType = getVersionChangeType(oldVersion, newVersion);
  
  if (!changeType) return false;
  
  const minChangeMap = {
    'patch': ['patch', 'minor', 'major'],
    'minor': ['minor', 'major'],
    'major': ['major']
  };
  
  return minChangeMap[CONFIG.minVersionChange]?.includes(changeType) || false;
}

/**
 * Fetches data from GitHub API
 */
function fetchGitHubAPI(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': '4wp-plugins-sync',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    if (CONFIG.githubToken) {
      options.headers['Authorization'] = `token ${CONFIG.githubToken}`;
    }
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} - ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Gets latest release from GitHub
 */
async function getLatestRelease(repoUrl) {
  try {
    // Convert repository URL to API endpoint
    // https://github.com/4wpdev/4wp-icons -> 4wpdev/4wp-icons
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    if (!repoMatch) {
      throw new Error(`Invalid GitHub URL: ${repoUrl}`);
    }
    
    const repoPath = repoMatch[1].replace(/\.git$/, '');
    const releasesUrl = `${CONFIG.githubApiBase}/repos/${repoPath}/releases/latest`;
    
    const release = await fetchGitHubAPI(releasesUrl);
    return {
      version: release.tag_name.replace(/^v/, ''), // Remove 'v' from tag
      published_at: release.published_at,
      download_url: release.zipball_url || release.tarball_url
    };
  } catch (error) {
    // If no releases, try to get latest tag
    try {
      const repoMatch = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      const repoPath = repoMatch[1].replace(/\.git$/, '');
      const tagsUrl = `${CONFIG.githubApiBase}/repos/${repoPath}/tags`;
      
      const tags = await fetchGitHubAPI(tagsUrl);
      if (tags && tags.length > 0) {
        return {
          version: tags[0].name.replace(/^v/, ''),
          published_at: tags[0].commit?.commit?.author?.date || new Date().toISOString(),
          download_url: null
        };
      }
    } catch (tagError) {
      console.warn(`Could not fetch tags for ${repoUrl}: ${tagError.message}`);
    }
    
    console.warn(`Could not fetch release for ${repoUrl}: ${error.message}`);
    return null;
  }
}

/**
 * Checks if repository has label for bundle inclusion
 */
async function hasBundleLabel(repoUrl) {
  try {
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    if (!repoMatch) return false;
    
    const repoPath = repoMatch[1].replace(/\.git$/, '');
    const repoUrl_api = `${CONFIG.githubApiBase}/repos/${repoPath}`;
    
    const repo = await fetchGitHubAPI(repoUrl_api);
    
    // Check topics (labels for repository)
    if (repo.topics && Array.isArray(repo.topics)) {
      return repo.topics.includes(CONFIG.bundleLabel);
    }
    
    return false;
  } catch (error) {
    console.warn(`Could not check bundle label for ${repoUrl}: ${error.message}`);
    return false;
  }
}

/**
 * Gets plugin information from GitHub
 */
async function getPluginInfo(plugin) {
  const release = await getLatestRelease(plugin.repository);
  const inBundle = await hasBundleLabel(plugin.repository);
  
  return {
    ...plugin,
    latestVersion: release?.version || plugin.version,
    hasUpdate: release && shouldUpdateVersion(plugin.version, release.version),
    inBundle: inBundle,
    releaseDate: release?.published_at || null,
    downloadUrl: release?.download_url || null
  };
}

/**
 * Updates plugins.json
 */
async function syncPlugins() {
  console.log('🔄 Starting plugins sync...\n');
  
  // Read current plugins.json
  const pluginsJson = JSON.parse(fs.readFileSync(CONFIG.pluginsJsonPath, 'utf8'));
  
  const updates = [];
  const errors = [];
  
  // Sync plugins
  console.log('📦 Syncing plugins...');
  for (const plugin of pluginsJson.plugins) {
    try {
      console.log(`  Checking ${plugin.name} (${plugin.slug})...`);
      const info = await getPluginInfo(plugin);
      
      if (info.hasUpdate) {
        const oldVersion = plugin.version;
        console.log(`    ✨ Update available: ${oldVersion} -> ${info.latestVersion}`);
        plugin.version = info.latestVersion;
        updates.push({
          plugin: plugin.name,
          oldVersion: oldVersion,
          newVersion: info.latestVersion
        });
      }
      
      // Update bundle inclusion status
      if (info.inBundle !== undefined) {
        plugin.inBundle = info.inBundle;
      }
      
      // Update download URL if available
      if (info.downloadUrl) {
        plugin.download_url = info.downloadUrl;
      }
      
      // Small delay to avoid exceeding rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`    ❌ Error syncing ${plugin.name}: ${error.message}`);
      errors.push({ plugin: plugin.name, error: error.message });
    }
  }
  
  // Sync bundle
  if (pluginsJson.bundle) {
    console.log('\n📦 Syncing bundle...');
    try {
      const bundleInfo = await getPluginInfo(pluginsJson.bundle);
      if (bundleInfo.hasUpdate) {
        const oldBundleVersion = pluginsJson.bundle.version;
        console.log(`  ✨ Bundle update: ${oldBundleVersion} -> ${bundleInfo.latestVersion}`);
        pluginsJson.bundle.version = bundleInfo.latestVersion;
        updates.push({
          plugin: 'Bundle',
          oldVersion: oldBundleVersion,
          newVersion: bundleInfo.latestVersion
        });
      }
    } catch (error) {
      console.error(`  ❌ Error syncing bundle: ${error.message}`);
      errors.push({ plugin: 'Bundle', error: error.message });
    }
  }
  
  // Update last updated date
  pluginsJson.lastUpdated = new Date().toISOString().split('T')[0];
  
  // Save updated file
  fs.writeFileSync(
    CONFIG.pluginsJsonPath,
    JSON.stringify(pluginsJson, null, 2) + '\n',
    'utf8'
  );
  
  // Output results
  console.log('\n✅ Sync completed!');
  
  if (updates.length > 0) {
    console.log('\n📝 Updates:');
    updates.forEach(update => {
      console.log(`  - ${update.plugin}: ${update.oldVersion} → ${update.newVersion}`);
    });
  } else {
    console.log('\n✨ All plugins are up to date!');
  }
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.forEach(err => {
      console.log(`  - ${err.plugin}: ${err.error}`);
    });
  }
  
  return { updates, errors };
}

// Run synchronization
if (require.main === module) {
  syncPlugins()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { syncPlugins, getPluginInfo };
