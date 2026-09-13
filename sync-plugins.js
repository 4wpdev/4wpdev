#!/usr/bin/env node

/**
 * 4WP Plugins Sync
 *
 * Updates plugins.json from:
 * 1) WordPress.org Plugins API (Stable) when wordpress_org is true / listing exists
 * 2) GitHub: latest release → latest tag → Version header on default branch
 *
 * Catalog `version` = W.org Stable when published, otherwise GitHub version.
 * Also stores github_version / wordpress_org_version when both exist (drift visibility).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }
      const eq = trimmed.indexOf('=');
      if (eq <= 0) {
        return;
      }
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
}

loadEnvFile();

const CONFIG = {
  pluginsJsonPath: path.join(__dirname, 'plugins.json'),
  githubApiBase: 'https://api.github.com',
  githubToken: process.env.GITHUB_TOKEN || '',
  wporgApiBase: 'https://api.wordpress.org/plugins/info/1.2/',
  userAgent: '4WP-Catalog-Sync/1.1 (+https://github.com/4wpdev/4wpdev)',
};

function normalizeVersion(raw) {
  if (!raw || typeof raw !== 'string') {
    return '';
  }
  return raw.trim().replace(/^v/i, '');
}

function compareVersions(v1, v2) {
  const a = normalizeVersion(v1)
    .split(/[.+-]/)
    .map((p) => (/^\d+$/.test(p) ? Number(p) : p));
  const b = normalizeVersion(v2)
    .split(/[.+-]/)
    .map((p) => (/^\d+$/.test(p) ? Number(p) : p));
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (typeof x === 'number' && typeof y === 'number') {
      if (x < y) return -1;
      if (x > y) return 1;
      continue;
    }
    const xs = String(x);
    const ys = String(y);
    if (xs < ys) return -1;
    if (xs > ys) return 1;
  }
  return 0;
}

function httpGetJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': CONFIG.userAgent,
          Accept: 'application/json',
          ...headers,
        },
        timeout: 30000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 404) {
            resolve(null);
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(`HTTP ${res.statusCode} for ${url}: ${data.slice(0, 200)}`)
            );
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON from ${url}: ${e.message}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function httpGetText(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': CONFIG.userAgent,
          ...headers,
        },
        timeout: 30000,
      },
      (res) => {
        // Follow one redirect (raw.githubusercontent sometimes).
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          httpGetText(res.headers.location, headers).then(resolve).catch(reject);
          res.resume();
          return;
        }
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 404) {
            resolve(null);
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(`HTTP ${res.statusCode} for ${url}: ${data.slice(0, 200)}`)
            );
            return;
          }
          resolve(data);
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function repoPathFromUrl(repoUrl) {
  const match = String(repoUrl || '').match(/github\.com\/([^/]+\/[^/#?]+)/i);
  if (!match) {
    return '';
  }
  return match[1].replace(/\.git$/, '');
}

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (CONFIG.githubToken) {
    headers.Authorization = `token ${CONFIG.githubToken}`;
  }
  return headers;
}

async function fetchWordPressOrg(slug) {
  const url =
    CONFIG.wporgApiBase +
    '?action=plugin_information&request[slug]=' +
    encodeURIComponent(slug) +
    '&request[fields][download_link]=1' +
    '&request[fields][active_installs]=1' +
    '&request[fields][last_updated]=1' +
    '&request[fields][requires]=1' +
    '&request[fields][requires_php]=1' +
    '&request[fields][rating]=1' +
    '&request[fields][num_ratings]=1';

  const data = await httpGetJson(url);
  if (!data || typeof data !== 'object' || data.error || !data.version) {
    return null;
  }

  return {
    version: normalizeVersion(String(data.version)),
    download_url:
      data.download_link ||
      `https://downloads.wordpress.org/plugin/${slug}.${data.version}.zip`,
    wordpress_org_url: `https://wordpress.org/plugins/${slug}/`,
    active_installs:
      typeof data.active_installs === 'number' ? data.active_installs : null,
    last_updated: data.last_updated || null,
    requires: data.requires || null,
    requires_php: data.requires_php || null,
    rating: typeof data.rating === 'number' ? data.rating : null,
    num_ratings: typeof data.num_ratings === 'number' ? data.num_ratings : null,
  };
}

async function fetchGitHubReleaseOrTag(repoPath) {
  if (!repoPath) {
    return null;
  }

  try {
    const release = await httpGetJson(
      `${CONFIG.githubApiBase}/repos/${repoPath}/releases/latest`,
      githubHeaders()
    );
    if (release && release.tag_name) {
      return {
        version: normalizeVersion(release.tag_name),
        source: 'release',
        download_url: release.zipball_url || null,
        published_at: release.published_at || null,
      };
    }
  } catch (e) {
    // no releases — try tags
  }

  try {
    const tags = await httpGetJson(
      `${CONFIG.githubApiBase}/repos/${repoPath}/tags?per_page=5`,
      githubHeaders()
    );
    if (Array.isArray(tags) && tags.length && tags[0].name) {
      return {
        version: normalizeVersion(tags[0].name),
        source: 'tag',
        download_url: tags[0].zipball_url || null,
        published_at: null,
      };
    }
  } catch (e) {
    // continue to header
  }

  return null;
}

function parseVersionFromPluginHeader(phpSource) {
  if (!phpSource) {
    return '';
  }
  const match = phpSource.match(/^[ \t]*\*?[ \t]*Version:\s*([^\r\n]+)/im);
  return match ? normalizeVersion(match[1]) : '';
}

async function fetchGitHubHeaderVersion(repoPath, slug) {
  if (!repoPath || !slug) {
    return null;
  }

  // Resolve default branch.
  let defaultBranch = 'main';
  try {
    const repo = await httpGetJson(
      `${CONFIG.githubApiBase}/repos/${repoPath}`,
      githubHeaders()
    );
    if (repo && repo.default_branch) {
      defaultBranch = repo.default_branch;
    }
  } catch (e) {
    // keep main
  }

  const candidates = [`${slug}.php`, `${slug}/${slug}.php`, 'plugin.php'];
  for (const filePath of candidates) {
    const rawUrl = `https://raw.githubusercontent.com/${repoPath}/${defaultBranch}/${filePath}`;
    try {
      const text = await httpGetText(rawUrl);
      const version = parseVersionFromPluginHeader(text);
      if (version) {
        return {
          version,
          source: 'header',
          file: filePath,
          branch: defaultBranch,
          download_url: `https://github.com/${repoPath}/archive/refs/heads/${defaultBranch}.zip`,
        };
      }
    } catch (e) {
      // try next path
    }
  }

  return null;
}

async function resolveGitHubVersion(plugin) {
  const repoPath = repoPathFromUrl(plugin.repository);
  if (!repoPath) {
    return null;
  }

  const releaseOrTag = await fetchGitHubReleaseOrTag(repoPath);
  const header = await fetchGitHubHeaderVersion(repoPath, plugin.slug);

  const candidates = [];
  if (header && header.version) {
    candidates.push(header);
  }
  if (releaseOrTag && releaseOrTag.version) {
    candidates.push(releaseOrTag);
  }
  if (!candidates.length) {
    return null;
  }

  // Prefer the highest semver. Header usually reflects current main;
  // stale tags (common when releases go to WordPress.org SVN only) lose.
  candidates.sort((a, b) => compareVersions(b.version, a.version));
  const best = candidates[0];

  // If header ties or is close, prefer header as source of truth for "git HEAD".
  if (
    header &&
    header.version &&
    compareVersions(header.version, best.version) === 0
  ) {
    return header;
  }

  return best;
}

function applyRequires(plugin, wporg) {
  if (!wporg) {
    return;
  }
  if (!plugin.requires || typeof plugin.requires !== 'object') {
    plugin.requires = {};
  }
  if (wporg.requires) {
    plugin.requires.wordpress = String(wporg.requires);
  }
  if (wporg.requires_php) {
    plugin.requires.php = String(wporg.requires_php);
  }
}

async function syncOnePlugin(plugin) {
  const result = {
    slug: plugin.slug,
    name: plugin.name,
    changed: false,
    notes: [],
  };

  const preferWporg =
    plugin.wordpress_org === true || plugin.wordpress_org === 'auto';

  let wporg = null;
  // Always probe W.org for known slugs; mark true if found.
  try {
    wporg = await fetchWordPressOrg(plugin.slug);
  } catch (e) {
    result.notes.push(`wporg error: ${e.message}`);
  }

  let github = null;
  try {
    github = await resolveGitHubVersion(plugin);
  } catch (e) {
    result.notes.push(`github error: ${e.message}`);
  }

  const oldVersion = plugin.version;

  if (wporg) {
    plugin.wordpress_org = true;
    plugin.wordpress_org_url = wporg.wordpress_org_url;
    plugin.wordpress_org_version = wporg.version;
    if (wporg.active_installs !== null) {
      plugin.active_installs = wporg.active_installs;
    }
    if (wporg.last_updated) {
      plugin.wordpress_org_updated = wporg.last_updated;
    }
    applyRequires(plugin, wporg);

    // Catalog version for Bundle installs = directory Stable.
    if (plugin.version !== wporg.version) {
      plugin.version = wporg.version;
      result.changed = true;
      result.notes.push(`version ${oldVersion} → ${wporg.version} (wordpress.org)`);
    }
    plugin.download_url = wporg.download_url;
  } else if (preferWporg) {
    plugin.wordpress_org = false;
    result.notes.push('expected on wordpress.org but listing missing');
  } else {
    plugin.wordpress_org = false;
  }

  if (github) {
    plugin.github_version = github.version;
    plugin.github_version_source = github.source;
    if (!wporg) {
      // Do not downgrade catalog on a stale lower tag when we already had a higher version.
      const canSet =
        !oldVersion ||
        compareVersions(github.version, oldVersion) >= 0 ||
        github.source === 'header';
      if (canSet && plugin.version !== github.version) {
        // Still avoid replacing a numeric stable with a lower pre-release tag.
        const downgrade =
          oldVersion && compareVersions(github.version, oldVersion) < 0;
        if (!downgrade || github.source === 'header') {
          plugin.version = github.version;
          result.changed = true;
          result.notes.push(
            `version ${oldVersion} → ${github.version} (github:${github.source})`
          );
        } else {
          result.notes.push(
            `kept ${oldVersion}; ignored lower github ${github.version} (${github.source})`
          );
        }
      }
      if (github.download_url) {
        plugin.download_url = github.download_url;
      } else if (plugin.repository) {
        plugin.download_url =
          String(plugin.repository).replace(/\/$/, '') +
          '/archive/refs/heads/main.zip';
      }
    } else if (
      github.version &&
      compareVersions(github.version, wporg.version) !== 0
    ) {
      result.notes.push(
        `drift: github ${github.version} (${github.source}) vs w.org ${wporg.version}`
      );
    }
  } else if (!wporg) {
    result.notes.push('no wordpress.org and no github version found');
  }

  if (!plugin.documentation_url && plugin.slug) {
    plugin.documentation_url = `https://4wp.dev/plugin/${plugin.slug}/`;
  }

  // Keep explicit inBundle; only set true if previously unset and W.org.
  if (plugin.inBundle === undefined) {
    plugin.inBundle = !!wporg;
  }

  return result;
}

async function syncPlugins() {
  console.log('Starting 4WP plugins sync (WordPress.org + GitHub)…\n');
  if (CONFIG.githubToken) {
    console.log('GITHUB_TOKEN: present\n');
  } else {
    console.log(
      'GITHUB_TOKEN: missing (unauthenticated GitHub limits apply)\n'
    );
  }

  const pluginsJson = JSON.parse(
    fs.readFileSync(CONFIG.pluginsJsonPath, 'utf8')
  );
  const reports = [];

  for (const plugin of pluginsJson.plugins || []) {
    if (plugin.status === 'superseded') {
      console.log(`· skip superseded ${plugin.slug}`);
      continue;
    }
    process.stdout.write(`· ${plugin.slug}… `);
    try {
      const report = await syncOnePlugin(plugin);
      reports.push(report);
      console.log(
        report.notes.length ? report.notes.join('; ') : 'ok'
      );
    } catch (e) {
      console.log(`ERROR ${e.message}`);
      reports.push({
        slug: plugin.slug,
        name: plugin.name,
        changed: false,
        notes: [e.message],
      });
    }
    await new Promise((r) => setTimeout(r, CONFIG.githubToken ? 250 : 900));
  }

  if (pluginsJson.bundle) {
    process.stdout.write(`· bundle ${pluginsJson.bundle.slug}… `);
    try {
      const github = await resolveGitHubVersion(pluginsJson.bundle);
      if (github) {
        const old = pluginsJson.bundle.version;
        const downgrade =
          old && compareVersions(github.version, old) < 0 && github.source !== 'header';
        if (!downgrade && old !== github.version) {
          pluginsJson.bundle.version = github.version;
          console.log(`${old} → ${github.version} (github:${github.source})`);
        } else if (downgrade) {
          console.log(
            `kept ${old}; ignored lower github ${github.version} (${github.source})`
          );
        } else {
          console.log(`ok ${github.version} (${github.source})`);
        }
        pluginsJson.bundle.github_version = github.version;
        pluginsJson.bundle.github_version_source = github.source;
      } else {
        console.log('no github version');
      }
      pluginsJson.bundle.wordpress_org = false;
    } catch (e) {
      console.log(`ERROR ${e.message}`);
    }
  }

  pluginsJson.lastUpdated = new Date().toISOString().split('T')[0];
  pluginsJson.meta = {
    ...(pluginsJson.meta || {}),
    wordpress_org_profile: 'https://profiles.wordpress.org/4wpdev/',
    version_source:
      'wordpress_org:true → Stable from api.wordpress.org; else GitHub release/tag/header. github_version kept for drift.',
    synced_at: new Date().toISOString(),
    marker_docs: 'docs/wordpress-org-plugins.md',
  };

  fs.writeFileSync(
    CONFIG.pluginsJsonPath,
    JSON.stringify(pluginsJson, null, 2) + '\n',
    'utf8'
  );

  const changed = reports.filter((r) => r.changed);
  console.log('\nDone.');
  console.log(`Changed: ${changed.length}`);
  changed.forEach((r) => console.log(`  - ${r.slug}: ${r.notes.join('; ')}`));

  const drifts = reports.filter((r) =>
    r.notes.some((n) => String(n).startsWith('drift:'))
  );
  if (drifts.length) {
    console.log('\nGitHub ↔ WordPress.org drift:');
    drifts.forEach((r) => {
      console.log(
        `  - ${r.slug}: ${r.notes.filter((n) => String(n).startsWith('drift:')).join('; ')}`
      );
    });
  }

  return { reports, pluginsJson };
}

if (require.main === module) {
  syncPlugins()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal:', error);
      process.exit(1);
    });
}

module.exports = { syncPlugins, fetchWordPressOrg, resolveGitHubVersion };
