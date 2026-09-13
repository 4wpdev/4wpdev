<div align="center">

# 🚀 4WP.dev

### Modular WordPress Ecosystem

[![Website](https://img.shields.io/badge/🌐-4wp.dev-00a0d2?style=for-the-badge)](https://4wp.dev)
[![GitHub](https://img.shields.io/badge/GitHub-4wpdev-181717?style=for-the-badge&logo=github)](https://github.com/4wpdev)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A modular, Gutenberg-first WordPress platform for developers, agencies, and businesses.**

[Plugins](#-plugins-showcase) • [Architecture](#-architecture-principles) • [Get Started](#-getting-started) • [Connect](#-connect--follow)

---

</div>

## ✨ What is 4WP?

4WP is a **lightweight, scalable, and modular WordPress ecosystem** designed to be both **developer-friendly** and **business-ready**. Our ecosystem consists of a core bundle and a growing collection of modular plugins that work independently or seamlessly integrated.

### 🎯 Core Philosophy

- 🧩 **Modular** — Independent plugins that work standalone or together
- ⚡ **Lightweight** — No bloat, just what you need
- 🎨 **Gutenberg-Native** — Built for the modern WordPress editor
- 🔧 **Developer-Friendly** — Clean code, clear documentation
- 🚀 **Production-Ready** — Battle-tested for real-world projects

---

## 🧩 Core Platform

### 🔹 4WP Bundle

The heart of the ecosystem — manages shared logic, integrations, and future add-ons.

[![Repository](https://img.shields.io/badge/📦-4wp--bundle-00a0d2?style=flat-square)](https://github.com/4wpdev/4wp-bundle)
[![GitHub Stars](https://img.shields.io/github/stars/4wpdev/4wp-bundle?style=flat-square&logo=github)](https://github.com/4wpdev/4wp-bundle)
[![Version](https://img.shields.io/badge/version-1.0.5-blue?style=flat-square)](https://github.com/4wpdev/4wp-bundle/releases)

---

## 📦 Plugins Showcase

We maintain a curated collection of modular plugins. Each plugin is designed to work independently or integrated through the **4WP Bundle**.

Versions for plugins on [WordPress.org (@4wpdev)](https://profiles.wordpress.org/4wpdev/) come from the directory Stable tag; others from GitHub (release / tag / plugin header). Synced by `sync-plugins.js`.

| Plugin | Version | WordPress.org | Repository | Status |
|--------|---------|---------------|------------|--------|
| **4WP Account** | `1.1.1` | [W.org](https://wordpress.org/plugins/4wp-account/) | [Repo](https://github.com/4wpdev/4wp-account) | ✅ Active |
| **4WP Advanced Code** | `1.0.1` | [W.org](https://wordpress.org/plugins/4wp-advanced-code/) | [Repo](https://github.com/4wpdev/4wp-advanced-code) | ✅ Active |
| **4WP Drive** | `1.5.0` | [W.org](https://wordpress.org/plugins/4wp-drive/) | [Repo](https://github.com/4wpdev/4wp-drive) | ✅ Active |
| **4WP FAQ** | `2.4.0` | [W.org](https://wordpress.org/plugins/4wp-faq/) | [Repo](https://github.com/4wpdev/4wp-faq) | ✅ Active |
| **4WP Notifications** | `1.2.0` | [W.org](https://wordpress.org/plugins/4wp-notifications/) | [Repo](https://github.com/4wpdev/4wp-notifications) | ✅ Active |
| **4WP SEO Helper** | `2.1.0` | [W.org](https://wordpress.org/plugins/4wp-seo-helper/) | [Repo](https://github.com/4wpdev/4wp-seo-helper) | ✅ Active |
| **4WP Smart Link** | `1.3.0` | [W.org](https://wordpress.org/plugins/4wp-smart-link/) | [Repo](https://github.com/4wpdev/4wp-smart-link) | ✅ Active |
| **4WP Style Switcher** | `1.0.1` | [W.org](https://wordpress.org/plugins/4wp-style-switcher/) | [Repo](https://github.com/4wpdev/4wp-style-switcher) | ✅ Active |
| **4WP TODO** | `1.0.2` | [W.org](https://wordpress.org/plugins/4wp-todo/) | [Repo](https://github.com/4wpdev/4wp-todo) | ✅ Active |
| **4WP Weather** | `2.0.0` | [W.org](https://wordpress.org/plugins/4wp-weather/) | [Repo](https://github.com/4wpdev/4wp-weather) | ✅ Active |
| **4WP Booking** | `0.4.1` | [W.org](https://wordpress.org/plugins/4wp-booking/) | [Repo](https://github.com/4wpdev/4wp-booking) | ✅ Active |
| **4WP QL Blocks** | `0.1.10` | — | [Repo](https://github.com/4wpdev/4wp-ql-blocks) | ✅ Active |
| **4WP Icons** | `0.2.3` | — | [Repo](https://github.com/4wpdev/4wp-icons) | ✅ Active |
| **4WP Mega Menu** | `1.0.1` | — | [Repo](https://github.com/4wpdev/4wp-mega-menu) | ✅ Active |
| **4WP Responsive** | `0.1.0` | — | [Repo](https://github.com/4wpdev/4wp-responsive) | ✅ Active |
| **4WP MCP Abilities** | `0.2.1` | — | [Repo](https://github.com/4wpdev/4wp-mcp-abilities) | ✅ Active |
| **LMS4WP** | `1.10.0` | — | [Repo](https://github.com/4wpdev/lms4wp) | ✅ Active |


> 💡 **Tip:** The complete plugin list is synced with [`plugins.json`](plugins.json). Map notes: [`docs/wordpress-org-plugins.md`](docs/wordpress-org-plugins.md).  
> 📅 **Last updated:** 2026-09-13

---

## ⚙️ Architecture Principles

Our plugins follow a consistent architecture that ensures quality, maintainability, and scalability:

<div align="center">

| Principle | Description |
|-----------|-------------|
| 🧩 **Modular Structure** | Independent plugins that can work standalone |
| 🔗 **Bundle-Aware** | Seamless integration through 4WP Bundle |
| 🎨 **Gutenberg-Native** | Built specifically for the modern WordPress editor |
| 📏 **WordPress Standards** | Follows WordPress coding standards and best practices |
| 📈 **Scalable** | Designed to grow with your project needs |

</div>

---

## 🚀 Getting Started

### Quick Start

1. **Explore Plugins**  
   Check out our [`plugins.json`](plugins.json) to see all available plugins.

2. **Install Core Bundle** (Optional)  
   Install the **4WP Bundle** if you want integrated functionality across plugins.
   ```bash
   # Via Composer
   composer require 4wpdev/4wp-bundle
   ```

3. **Add Plugins**  
   Install only the plugins you need. All plugins work out-of-the-box!

### Installation Options

- **WordPress Admin** — Upload via Plugins → Add New
- **Composer** — `composer require 4wpdev/[plugin-name]`
- **Git** — Clone directly from GitHub repositories

---

## 🔄 Plugin Synchronization

We use an automated sync system to keep plugin versions up-to-date from GitHub releases.

### How It Works

The sync script automatically:
- ✅ Checks latest releases/tags from GitHub
- ✅ Detects version changes (1.1.0 → 1.2.0)
- ✅ Updates `plugins.json` automatically
- ✅ Supports GitHub Topics for bundle inclusion

### Example Output

```bash
$ node sync-plugins.js

🔄 Starting plugins sync...

✅ GITHUB_TOKEN loaded successfully

📦 Syncing plugins...
  Checking 4WP QL Blocks (4wp-ql-blocks)...
  Checking 4WP Icons (4wp-icons)...
    ✨ Update available: 0.2.2 -> 0.2.3
  Checking 4WP Mega Menu (4wp-mega-menu)...
  Checking 4WP Responsive (4wp-responsive)...
  Checking 4WP FAQ (4wp-faq)...
  Checking 4WP Advanced Code (4wp-advanced-code)...

📦 Syncing bundle...
  ✨ Bundle update: 1.0.2 -> 1.0.3

✅ Sync completed!

📝 Updates:
  - 4WP Icons: 0.2.2 → 0.2.3
  - Bundle: 1.0.2 → 1.0.3

✨ All plugins are up to date!
```

### Regenerate README

After syncing plugins, regenerate README to reflect latest changes:

```bash
npm run generate:readme
# or
node generate-readme.js
```

For more details, see [SYNC-README.md](SYNC-README.md).

---

## 🔧 Tech Stack

<div align="center">

![WordPress](https://img.shields.io/badge/WordPress-21759B?style=for-the-badge&logo=wordpress&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.x+-777BB4?style=for-the-badge&logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-React-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

</div>

- **WordPress & Gutenberg** — Modern block editor
- **PHP 8.x+** — Latest PHP features and performance
- **JavaScript (React)** — Interactive Gutenberg blocks
- **SCSS / CSS** — Modern styling utilities
- **Schema.org** — Structured data support

---

## 🔗 Connect & Follow

Stay updated with 4WP across all platforms:

<div align="center">

[![Website](https://img.shields.io/badge/🌐-Website-00a0d2?style=flat-square&logo=wordpress)](https://4wp.dev)
[![GitHub](https://img.shields.io/badge/GitHub-4wpdev-181717?style=flat-square&logo=github)](https://github.com/4wpdev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-4wp--dev-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/company/4wp-dev/)
[![Facebook](https://img.shields.io/badge/Facebook-4wpdev-1877F2?style=flat-square&logo=facebook)](https://www.facebook.com/4wpdev)
[![Twitter](https://img.shields.io/badge/X-adovgun-000000?style=flat-square&logo=x)](https://x.com/adovgun)
[![Dev.to](https://img.shields.io/badge/Dev.to-adovgun-0A0A0A?style=flat-square&logo=dev.to)](https://dev.to/adovgun/)
[![Medium](https://img.shields.io/badge/Medium-@adovgun-000000?style=flat-square&logo=medium)](https://medium.com/@adovgun)
[![Hashnode](https://img.shields.io/badge/Hashnode-4wp-2962FF?style=flat-square&logo=hashnode)](https://4wp.hashnode.dev/)

</div>

---

## 🎯 Vision

> To build a **lightweight, scalable, and modular WordPress ecosystem** that empowers developers and businesses to create amazing websites without compromise.

**Key Benefits:**
- ✅ Works independently or integrated
- ✅ Maximum flexibility and control
- ✅ Clean, maintainable codebase
- ✅ Active development and support
- ✅ MIT licensed — use freely

---

## 📊 GitHub Stats

<div align="center">

![GitHub Org's stars](https://img.shields.io/github/stars/4wpdev?affiliations=OWNER&style=social)
![GitHub followers](https://img.shields.io/github/followers/4wpdev?style=social)

</div>

---

## 📄 License

All 4WP plugins are **MIT licensed**. Use freely, contribute, or fork as needed.

```
MIT License - feel free to use in personal or commercial projects.
```

---

<div align="center">

### Made with ❤️ by the 4WP Team

[⬆ Back to Top](#-4wpdev)

</div>
