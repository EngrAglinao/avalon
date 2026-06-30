# ⚔️ THE RESISTANCE: AVALON — Mobile PWA

> A mobile-first, PWA-enabled social deduction game application built as a single-file engine.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Project File Structure](#project-file-structure)
4. [Quick Start](#quick-start)
5. [Firebase Configuration](#firebase-configuration)
6. [Game Rules Reference](#game-rules-reference)
7. [Developer Testing (Demo Mode)](#developer-testing-demo-mode)
8. [Admin Panel](#admin-panel)
9. [🐙 GitHub Source Control & Lifecycle Deployment Workflow](#-github-source-control--lifecycle-deployment-workflow)
10. [Asset Specifications](#asset-specifications)
11. [PWA & Service Worker](#pwa--service-worker)
12. [Troubleshooting](#troubleshooting)

---

## Overview

**The Resistance: Avalon** PWA is a fully-featured digital companion app for the physical tabletop game of the same name. Built as a single HTML engine, it supports:

- 🔐 Firebase Authentication (Google OAuth + Guest mode)
- 🌐 Firebase Firestore real-time room synchronization
- 📱 Mobile-first portrait PWA with offline service worker caching
- 🎭 Full game loop: Nomination → Team Vote → Quest → Reveal → Assassination → Game Over
- 🗺️ Circular tabletop seating with immersive medieval visual design
- ⚙️ Master Admin panel for room management and live game control
- 📋 In-game social deduction tracker notepad
- 📜 Session game history log per authenticated user

---

## Features

| Feature | Status |
|---|---|
| Guest & Google Auth Login | ✅ |
| Firebase Realtime Sync | ✅ |
| Room Creation & Joining | ✅ |
| Role Assignment (shuffle) | ✅ |
| Circular Table Seating | ✅ |
| Nomination Phase | ✅ |
| Team Vote (Blind Registry) | ✅ |
| Quest Vote (Blind Registry) | ✅ |
| Card Flip Reveal Animation | ✅ |
| Assassination Phase | ✅ |
| Game Over Role Reveal | ✅ |
| Lady of the Lake Expansion | ✅ (toggle) |
| Master Admin Overrides | ✅ |
| Card Asset Hot-Swap Upload | ✅ |
| PWA Install Gate | ✅ |
| Offline Service Worker | ✅ |
| Side Nav Tracker Notepad | ✅ |
| Demo/Sandbox Mode | ✅ |

---

## Project File Structure

```
avalon-pwa/
│
├── index.html          ← Single-file application engine
│                         (All HTML, CSS, JS, Firebase hooks, game logic)
│
├── manifest.json       ← PWA manifest for mobile OS installation
│
├── sw.js               ← Service Worker: offline cache, background sync
│
├── README.md           ← This documentation file
│
├── cards/              ← Character & decision card art assets
│   ├── merlin.png
│   ├── percival.png
│   ├── good_generic.png
│   ├── good_generic_alt.png
│   ├── assassin.png
│   ├── morgana.png
│   ├── mordred.png
│   ├── oberon.png
│   ├── evil_generic.png
│   ├── evil_generic_alt.png
│   ├── quest_success.png
│   └── quest_fail.png
│
└── icons/              ← Board markers, tokens, and PWA badges
    ├── vote_approve.png
    ├── vote_reject.png
    ├── leader_token.png
    ├── quest_marker_good.png
    ├── quest_marker_evil.png
    ├── vote_tracker_token.png
    ├── team_shield.png
    ├── lady_token.png
    └── app_icon.png
```

> ⚠️ **STRICT FILE COMPLIANCE:** Only the 4 files and 2 asset directories listed above are permitted in this workspace. No additional scripts, stylesheets, config files, or auxiliary folders may be created.

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/avalon-pwa.git
cd avalon-pwa
```

### 2. Add Your Art Assets

Place your card and icon images into the `./cards/` and `./icons/` directories using the **exact filenames** specified in the file structure above.

### 3. Configure Firebase

Open `index.html` and locate the `FIREBASE_CONFIG` block near the top of the `<script>` section:

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

Alternatively, enter credentials through the **Firebase Setup Console** that appears on first launch.

### 4. Serve Locally

Use any local HTTPS-capable dev server (required for PWA features):

```bash
# Option A: npx serve (recommended)
npx serve . --listen 443 --ssl-cert cert.pem --ssl-key key.pem

# Option B: Python simple server (HTTP only — no PWA install)
python3 -m http.server 8080

# Option C: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

> ⚠️ Service Workers require **HTTPS** or `localhost`. Use `localhost` for development.

---

## Firebase Configuration

### Firebase Console Setup Steps

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in method → Enable **Google** and **Anonymous**
4. Enable **Firestore Database** → Start in **Test Mode** initially
5. Go to Project Settings → Web App → Copy the `firebaseConfig` object
6. Paste credentials into `FIREBASE_CONFIG` in `index.html`

### Firestore Security Rules (Production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Rooms: readable by all authenticated, writable by participants
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       request.auth.uid in resource.data.players.map(p, p.id);
      allow delete: if request.auth != null &&
                       request.auth.uid == resource.data.hostId;
    }

    // Card assets: readable by all, writable only by admin
    match /assets/{assetId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.auth.token.email == 'buenavistaaglinaodanny@gmail.com';
    }
  }
}
```

### Firestore Indexes Required

```
Collection: rooms
Fields: status (ASC), createdAt (DESC)
```

Create this index via the Firebase Console → Firestore → Indexes → Add.

---

## Game Rules Reference

### Quest Team Sizes

| Players | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|
| 5 | 2 | 3 | 2 | 3 | 3 |
| 6 | 2 | 3 | 4 | 3 | 4 |
| 7 | 2 | 3 | 3 | 4 | 4 |
| 8 | 3 | 4 | 4 | 5 | 5 |
| 9 | 3 | 4 | 4 | 5 | 5 |
| 10| 3 | 4 | 4 | 5 | 5 |

> ⚠️ Quest 4 requires **2 Fail cards** to fail in games with **7+ players**.

### Evil Player Counts

| Players | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|
| Evil | 2 | 2 | 3 | 3 | 3 | 4 |

### Phase Flow

```
NOMINATION → TEAM VOTE → QUEST VOTE → REVEAL → [ASSASSINATION] → GAME OVER
     ↑____________________|
     (If team rejected, advance leader, increment vote track)
     (If 5th rejection: Evil auto-wins that quest)
```

### Win Conditions

- **Good wins:** 3 quests succeed — then Assassination phase begins
- **Evil wins:** 3 quests fail — OR — Assassin correctly identifies Merlin

---

## Developer Testing (Demo Mode)

To enable the visual/phase testing sandbox, open `index.html` and change:

```javascript
// Line near top of <script> block:
const DEMO_MODE_ACTIVE = false;
// ↓ change to:
const DEMO_MODE_ACTIVE = true;
```

**Demo Mode behavior:**
- Bypasses all auth gates, lobby screens, and room creation
- Loads a pre-configured 5-player state immediately
- Shows a non-blocking control strip at the top with:
  - **POV Dropdown:** Switch between 5 simulated player perspectives
  - **⚡ Bot All button:** Automatically completes the current phase action

> ⚠️ **Never commit** `DEMO_MODE_ACTIVE = true` to the `main` production branch. The `sandbox-staging` branch is the designated location for demo testing.

---

## Admin Panel

The Master Admin Panel is accessible only when signed in as `buenavistaaglinaodanny@gmail.com`.

A floating ⚙️ gear icon appears at the bottom-right of the screen. Tapping it opens the panel.

### Admin Capabilities

| Control | Description |
|---|---|
| Lady of the Lake Toggle | Enable/disable the expansion mid-lobby |
| Card Asset Uploader | Upload PNG → Base64 → push to Firestore → hot-swap live art |
| Re-open Quest Voting | Reset quest vote phase for all players |
| Force Phase Advance | Skip directly to the next phase in the sequence |
| Drop to Lobby | Return all players to the waiting room |
| Terminate Room | Permanently delete the Firestore room document |
| Edit Firebase Config | Open the Firebase credentials setup console |

---

## 🐙 GitHub Source Control & Lifecycle Deployment Workflow

This section covers the complete workflow from initial local setup through production deployment via GitHub Pages.

---

### 1. Git Initialization

```bash
# Navigate to your project directory
cd avalon-pwa

# Initialize a new Git repository
git init

# Set default branch name to 'main'
git branch -M main

# Create a .gitignore file
cat > .gitignore << 'EOF'
# Operating system files
.DS_Store
.DS_Store?
._*
.Spotlight-V00
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# Editor and IDE configs
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Local development configs
.env
.env.local
*.local

# Node.js (if using npx serve or build tools)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Logs
*.log

# OS-generated
*~

# ─── TRACKED DIRECTORIES (DO NOT ADD TO .gitignore) ───
# ./cards/   ← MUST be tracked (game card art)
# ./icons/   ← MUST be tracked (token + PWA icons)
EOF

# Stage all project files
git add index.html manifest.json sw.js README.md

# Stage asset directories
git add cards/ icons/

# Verify what is staged
git status

# Make the initial commit
git commit -m "🏰 Initial commit: Avalon PWA — single-file engine v1.0.0"
```

---

### 2. GitHub Repository Synchronization

```bash
# Create a new repository on GitHub via CLI (requires gh CLI tool)
gh repo create avalon-pwa --public --description "The Resistance: Avalon — Mobile PWA"

# OR: Link to an existing empty GitHub repository manually:
git remote add origin https://github.com/YOUR_USERNAME/avalon-pwa.git

# Verify the remote URL
git remote -v

# Push main branch to GitHub
git push -u origin main

# ─── Day-to-day workflow ───

# Pull latest changes before editing
git pull origin main

# Stage specific files after changes
git add index.html

# Commit with a descriptive message
git commit -m "✨ feat: Add Lady of the Lake expansion toggle"

# Push to remote
git push origin main
```

---

### 3. Safe Single-File Branch Management

Use a multi-branch architecture to protect production code from in-progress testing changes.

```
main            ← 🚀 Production branch (DEMO_MODE_ACTIVE = false ALWAYS)
sandbox-staging ← 🧪 Testing branch (DEMO_MODE_ACTIVE = true allowed here)
feature/*       ← 🔨 Feature branches for isolated development
```

#### Branch Setup

```bash
# Create and switch to the sandbox-staging branch
git checkout -b sandbox-staging

# In sandbox-staging: set DEMO_MODE_ACTIVE = true in index.html
# ... make your changes ...

# Commit sandbox changes
git add index.html
git commit -m "🧪 sandbox: Enable demo mode for phase testing"

# Push sandbox branch
git push -u origin sandbox-staging

# ─── Merging tested features back to main ───

# Switch back to main
git checkout main

# Merge ONLY non-demo changes (not DEMO_MODE_ACTIVE = true)
git merge --no-ff feature/my-feature-branch

# IMPORTANT: Before pushing to main, verify DEMO_MODE_ACTIVE is false:
grep "DEMO_MODE_ACTIVE" index.html
# Expected: const DEMO_MODE_ACTIVE = false;

# Push to production
git push origin main
```

#### Feature Branch Workflow

```bash
# Create a feature branch from main
git checkout main
git checkout -b feature/admin-panel-improvements

# Develop your feature...
git add index.html
git commit -m "✨ feat: Improve admin card uploader UI"

# Push feature branch
git push -u origin feature/admin-panel-improvements

# Open Pull Request on GitHub for code review before merging to main
# OR merge locally:
git checkout main
git merge --no-ff feature/admin-panel-improvements
git push origin main

# Delete the feature branch after merge
git branch -d feature/admin-panel-improvements
git push origin --delete feature/admin-panel-improvements
```

---

### 4. Automated CDN & Static Hosting via GitHub Pages

GitHub Pages serves the Avalon PWA directly from the repository root with HTTPS — no build step required.

#### Initial GitHub Pages Setup

```bash
# Ensure you are on the main branch
git checkout main

# GitHub Pages is configured via the GitHub web interface:
# 1. Go to: https://github.com/YOUR_USERNAME/avalon-pwa
# 2. Click: Settings → Pages
# 3. Source: Deploy from a branch
# 4. Branch: main
# 5. Folder: / (root)
# 6. Click Save

# Your app will be live at:
# https://YOUR_USERNAME.github.io/avalon-pwa/
```

#### GitHub Actions — Automated Deployment Pipeline

Create a workflow file at `.github/workflows/deploy.yml` to auto-deploy on every push to `main`:

> Note: This workflow file reference is provided for documentation only. Per workspace compliance rules, no extra files are created in this project.

```yaml
# .github/workflows/deploy.yml
name: 🚀 Deploy Avalon PWA to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  validate:
    name: ✅ Validate Production Safety
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check DEMO_MODE_ACTIVE is false
        run: |
          if grep -q "DEMO_MODE_ACTIVE = true" index.html; then
            echo "❌ ERROR: DEMO_MODE_ACTIVE is true in index.html! Cannot deploy to production."
            exit 1
          fi
          echo "✅ DEMO_MODE_ACTIVE = false confirmed."

      - name: Check Firebase credentials are not empty
        run: |
          if grep -q '"apiKey": ""' index.html; then
            echo "⚠️ WARNING: Firebase credentials appear unconfigured."
          else
            echo "✅ Firebase config detected."
          fi

  deploy:
    name: 🚀 Deploy to GitHub Pages
    needs: validate
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Deployment URLs

| Branch | URL | Purpose |
|---|---|---|
| `main` | `https://YOUR_USERNAME.github.io/avalon-pwa/` | Production live app |
| `sandbox-staging` | `https://YOUR_USERNAME.github.io/avalon-pwa/` *(via manual deploy)* | Pre-release testing |

#### Custom Domain (Optional)

```bash
# Add a CNAME file to the repo root
echo "avalon.yourdomain.com" > CNAME
git add CNAME
git commit -m "🌐 config: Add custom domain CNAME"
git push origin main

# Then configure DNS:
# Type: CNAME
# Name: avalon
# Value: YOUR_USERNAME.github.io
```

---

### Git Commit Message Convention

Use the following prefixes for a clean, readable commit history:

| Prefix | Usage |
|---|---|
| `✨ feat:` | New feature added |
| `🐛 fix:` | Bug fix |
| `🎨 style:` | CSS / visual-only changes |
| `♻️ refactor:` | Code restructure without feature change |
| `🧪 sandbox:` | Demo mode or testing changes (sandbox-staging only) |
| `🚀 deploy:` | Deployment configuration changes |
| `📝 docs:` | Documentation updates |
| `🔥 remove:` | Removing code or files |
| `⚡ perf:` | Performance improvements |
| `🔒 security:` | Security-related changes |

---

## Asset Specifications

### Card Assets (`./cards/`)

All card images should be provided as **PNG files** with a **portrait aspect ratio** (recommended: `300×420px` or `2:3 ratio`) for optimal display in card flip animations.

| File | Role | Alignment |
|---|---|---|
| `merlin.png` | Merlin | Good |
| `percival.png` | Percival | Good |
| `good_generic.png` | Loyal Servant | Good |
| `good_generic_alt.png` | Loyal Servant (alt) | Good |
| `assassin.png` | Assassin | Evil |
| `morgana.png` | Morgana | Evil |
| `mordred.png` | Mordred | Evil |
| `oberon.png` | Oberon | Evil |
| `evil_generic.png` | Minion of Mordred | Evil |
| `evil_generic_alt.png` | Minion of Mordred (alt) | Evil |
| `quest_success.png` | Quest Success Card | — |
| `quest_fail.png` | Quest Fail Card | — |

### Icon Assets (`./icons/`)

All icon images should be provided as **square PNG files** (recommended: `192×192px` minimum).

| File | Usage |
|---|---|
| `app_icon.png` | PWA app icon (homescreen / manifest) |
| `vote_approve.png` | Approve vote button icon |
| `vote_reject.png` | Reject vote button icon |
| `leader_token.png` | Leader crown marker |
| `quest_marker_good.png` | Quest success card back icon |
| `quest_marker_evil.png` | Quest fail card back icon |
| `vote_tracker_token.png` | Vote track progress marker |
| `team_shield.png` | Team nomination shield badge |
| `lady_token.png` | Lady of the Lake expansion token |

---

## PWA & Service Worker

The `sw.js` service worker implements three caching strategies:

| Request Type | Strategy | Cache Name |
|---|---|---|
| Local HTML, manifest, sw.js | Cache-First | `avalon-v1.0.0-static` |
| Card & icon assets | Cache-First | `avalon-v1.0.0-assets` |
| Google Fonts, CDN libraries | Stale-While-Revalidate | `avalon-v1.0.0-dynamic` |
| Firebase / Firestore API | No cache (live only) | — |
| All other requests | Network-First | `avalon-v1.0.0-dynamic` |

### Updating the Cache

When deploying a new version, bump the `CACHE_VERSION` constant in `sw.js`:

```javascript
const CACHE_VERSION = 'avalon-v1.0.1'; // ← increment this
```

This triggers automatic purging of all stale caches on next install.

---

## Troubleshooting

### PWA install prompt not showing
- Must be served over **HTTPS** (or `localhost`)
- Must have a valid `manifest.json` with `start_url` and at least one icon
- Service worker must be registered and active
- User must have visited the page twice with 5+ minutes between visits (Chrome heuristic)

### Firebase auth popup blocked
- Ensure Firebase `authDomain` matches the domain the app is served from
- Add your domain to Firebase Console → Authentication → Authorized domains

### Circular table not rendering correctly
- The table arena renders on `DOMContentLoaded` — ensure `renderCircularTable()` is called after the game screen becomes visible
- Resize events re-trigger the render automatically

### Cards not showing
- Verify image files are in `./cards/` with exact filenames listed above
- `onerror` fallbacks are built in (emoji placeholders will show if images are missing)

### Service Worker not updating
- Open Chrome DevTools → Application → Service Workers → Check "Update on reload"
- Or increment `CACHE_VERSION` in `sw.js` and redeploy

---

## License

This application is a digital companion tool for personal, non-commercial use with the physical board game **The Resistance: Avalon** by Don Eskridge / Indie Boards and Cards.

All game mechanics, role names, and terminology are property of their respective rights holders.

---

*Built with ⚔️ by the Avalon PWA Engine — Single-file, mobile-first, Firebase-powered.*
