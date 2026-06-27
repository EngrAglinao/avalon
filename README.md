# ⚔️ The Resistance: Avalon — Mobile PWA

> *A mobile-first, Progressive Web App implementation of the acclaimed social deduction tabletop game. Built for immersive handheld gameplay with real-time Firebase multiplayer synchronization, rich medieval theming, and full PWA offline support.*

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Workspace File Matrix](#-workspace-file-matrix)
3. [Feature Set](#-feature-set)
4. [Quick Start (Local Dev)](#-quick-start-local-dev)
5. [Firebase Configuration](#-firebase-configuration)
6. [Card & Icon Asset Setup](#️-card--icon-asset-setup)
7. [Game Rules Reference](#️-game-rules-reference)
8. [Admin Panel Guide](#️-admin-panel-guide)
9. [Demo Mode Guide](#-demo-mode-guide)
10. [PWA Installation Guide](#-pwa-installation-guide)
11. [🐙 GitHub Source Control & Lifecycle Deployment Workflow](#-github-source-control--lifecycle-deployment-workflow)
12. [Troubleshooting](#-troubleshooting)

---

## 🏰 Project Overview

**The Resistance: Avalon** is a single-file, self-contained Progressive Web App delivering a complete digital adaptation of the physical tabletop game. Players join shared game rooms through Firebase Firestore, receive secret roles, nominate quest teams, cast blind ballots, and reveal outcomes through animated card mechanics — all within a richly styled medieval interface designed for mobile portrait screens.

### Core Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Shell** | Pure HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| **Styling Engine** | Tailwind CSS v4 (CDN) + Custom CSS Properties |
| **Typography** | Google Fonts: Cinzel Decorative, Cinzel, Inter |
| **Backend / Realtime** | Firebase v10 (Auth + Firestore) via ESM CDN |
| **PWA Layer** | Web App Manifest + Cache API Service Worker |
| **Hosting Target** | GitHub Pages (HTTPS, zero-build static hosting) |

---

## 📁 Workspace File Matrix

This project enforces a **strict 4-file + 2-directory architecture**. No additional files may be introduced.

```
avalon-pwa/
│
├── index.html          ← Single-file application engine
│                         (HTML + CSS + JavaScript + Firebase hooks)
│
├── manifest.json       ← PWA web app manifest (mobile OS install config)
│
├── sw.js               ← Service Worker (offline caching, push events)
│
├── README.md           ← This documentation file
│
├── cards/              ← 12 Core character & decision card assets
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
└── icons/              ← 9 Board markers, tokens, and badges
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

> **⚠️ Compliance Rule:** Creating any files outside this matrix (extra `.js` files, `.css` sheets, helper scripts, or unlisted icons) constitutes a workspace violation.

---

## ✨ Feature Set

### Gameplay Phases
- 🏰 **Nomination Phase** — Leader selects quest team from circular table
- ⚖️ **Team Vote Phase** — All players cast blind Approve/Reject ballots
- ⚔️ **Quest Phase** — Team members secretly choose Success or Fail
- 🎴 **Reveal Phase** — Leader taps shuffled cards one-by-one to reveal
- 🗡️ **Assassination Phase** — Assassin attempts to identify Merlin after Good wins

### Roles Supported
| Role | Team | Expansion |
|---|---|---|
| Merlin | Good | Core |
| Loyal Servant of Arthur | Good | Core |
| Assassin | Evil | Core |
| Minion of Mordred | Evil | Core |
| Percival | Good | Percival/Morgana Pack |
| Morgana | Evil | Percival/Morgana Pack |
| Mordred | Evil | Mordred Pack (7+ players) |
| Oberon | Evil | Oberon Pack (7+ players) |

### Technical Features
- 📱 **Mobile-First**: Locked to portrait orientation; desktop blocked
- 🔥 **Firebase Realtime Sync**: Firestore-powered room state
- 🌐 **Google OAuth**: Secure sign-in with profile integration
- 🎭 **Guest Mode**: Instant play without account creation
- 🗺️ **Circular Table Layout**: Dynamic elliptical player seating
- 🃏 **3D Card Animations**: GPU-accelerated CSS transform flips
- 📜 **Game History**: Persistent local match chronicle
- ⚙️ **Master Admin Panel**: Full live-game control for designated admin
- 🔇 **Blind Voting**: Zero vote disclosure until all ballots cast
- 🛡️ **Player Tracker**: Private alignment notes in side navigation
- 📲 **PWA Install Gate**: Non-dismissible install prompt in live mode

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- A modern smartphone or browser with DevTools mobile emulation
- (Optional) Node.js for a local static server

### Method A — Python Simple Server (Recommended for PWA testing)
```bash
# Clone or download project
cd avalon-pwa/

# Python 3
python3 -m http.server 8080

# Navigate to: http://localhost:8080
# Use Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M) for mobile emulation
```

### Method B — Node.js serve
```bash
npx serve . -p 8080
```

### Method C — VS Code Live Server
Install the **Live Server** extension, right-click `index.html` → Open with Live Server.

> **PWA Note:** Service Workers require **HTTPS or localhost**. Use `localhost` for local testing. GitHub Pages provides automatic HTTPS for production.

---

## 🔥 Firebase Configuration

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project** → Name it (e.g., `avalon-pwa`)
3. Disable Google Analytics (optional)

### Step 2: Enable Services
- **Authentication**: Console → Auth → Sign-in method → Enable **Google**
- **Firestore Database**: Console → Firestore → Create database → Start in **test mode**

### Step 3: Register Web App
Console → Project Overview → Add App → Web (`</>`) → Register → Copy config

### Step 4: Add Credentials (Two Options)

#### Option A — Hardcoded (Recommended for Production)
Open `index.html`, locate the placeholder block (Section 3), and uncomment:
```javascript
const FIREBASE_CONFIG_HARDCODED = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
};
```

#### Option B — Runtime Setup Console
On first launch (no credentials detected), the app shows the Firebase Setup Console. Paste each value into the form fields and click **Connect Firebase**. Credentials are saved to `localStorage`.

### Step 5: Configure Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Game rooms — authenticated or guest users
    match /rooms/{roomId} {
      allow read: if true;
      allow write: if request.auth != null || request.resource.data.keys().hasAny(['players']);
    }
    // Card assets — admin only writes
    match /assets/{assetId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'buenavistaaglinaodanny@gmail.com';
    }
  }
}
```

### Step 6: Configure Auth Domain for OAuth
Firebase Console → Authentication → Settings → Authorized Domains → Add your GitHub Pages domain:
```
yourusername.github.io
```

---

## 🖼️ Card & Icon Asset Setup

Place your custom art assets in the correct directories:

```bash
# Character Role Cards (recommended: 400x560px portrait, PNG)
./cards/merlin.png
./cards/percival.png
./cards/good_generic.png
./cards/good_generic_alt.png
./cards/assassin.png
./cards/morgana.png
./cards/mordred.png
./cards/oberon.png
./cards/evil_generic.png
./cards/evil_generic_alt.png
./cards/quest_success.png    # Blue shield imagery
./cards/quest_fail.png       # Red skull/dagger imagery

# UI Tokens & Icons (recommended: 256x256px square, PNG)
./icons/vote_approve.png
./icons/vote_reject.png
./icons/leader_token.png
./icons/quest_marker_good.png
./icons/quest_marker_evil.png
./icons/vote_tracker_token.png
./icons/team_shield.png
./icons/lady_token.png
./icons/app_icon.png         # App install icon (512x512px recommended)
```

**Asset Style Guide:**
- Style: Dark fantasy / medieval oil painting aesthetic
- Background: Transparent or dark (#11141a) for seamless blending
- Good cards: Royal blue, silver, gold borders
- Evil cards: Crimson, shadow red, black borders
- Card frame: Aged parchment or dark wood grain texture

**Admin Card Uploader:** The Master Admin Panel includes a live card uploader. Select a target slot, choose a file, and it will be Base64-encoded and stored in both localStorage and Firebase for instant hot-swapping.

---

## ⚔️ Game Rules Reference

### Player Count & Team Sizes
| Players | Good | Evil | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|---|---|
| 5 | 3 | 2 | 2 | 3 | 2 | 3 | 3 |
| 6 | 4 | 2 | 2 | 3 | 4 | 3 | 4 |
| 7 | 4 | 3 | 2 | 3 | 3 | 4* | 4 |
| 8 | 5 | 3 | 3 | 4 | 4 | 5* | 5 |
| 9 | 6 | 3 | 3 | 4 | 4 | 5* | 5 |
| 10 | 6 | 4 | 3 | 4 | 4 | 5* | 5 |

*\* Quest 4 in 7+ player games requires **2 Fail cards** to fail the quest.*

### Win Conditions
- **Good wins** if 3 quests succeed
- **Evil wins** if 3 quests fail OR 5 consecutive team proposals are rejected
- **Evil wins** if Good completes 3 quests but the Assassin correctly identifies Merlin

### Voting Rules
- **Team Vote**: Majority Approve = team goes on quest; Majority Reject (or tie) = leader passes clockwise
- **Quest Vote**: Any 1 Fail card fails the quest (except Quest 4 in 7+ player games requiring 2)
- **Blind Ballots**: Only the mathematical tally is revealed — never individual votes

---

## ⚙️ Admin Panel Guide

Access: Sign in as `buenavistaaglinaodanny@gmail.com` → floating ⚙️ gear icon appears.

| Control | Description |
|---|---|
| 🌊 Lady of the Lake Toggle | Enable/disable the Lady of the Lake expansion module |
| 🖼️ Card Asset Uploader | Upload custom PNG images; auto Base64-encodes and syncs to Firebase |
| 🔄 Re-open Quest Voting | Resets quest ballots and re-enters the quest voting phase |
| ⏭️ Force-Advance Phase | Manually skip to the next game phase |
| 🏠 Drop to Lobby | Ejects all players back to the lobby screen |
| 💀 Terminate Room | Deletes the Firestore room document and ends the game |
| 🔥 Firebase Config | Opens the credential editor to update Firebase connection |

---

## 🎮 Demo Mode Guide

**Purpose:** Instant visual and phase testing — bypasses all authentication and lobby flows.

**Activation:**
```javascript
// In index.html, Section 2 — change false to true:
const DEMO_MODE_ACTIVE = false;  // ← Change to true
```

**What happens:**
1. A yellow control strip pins to the top of the viewport
2. A 5-player state loads immediately (Arthur, Merlin, Percival, Morgana, Assassin)
3. The game table renders in nomination phase
4. Use the **⚡ Bot All** button to auto-fill the current phase action
5. Use the **→ Phase** button to force-advance through phases
6. Use the player dropdown to switch the active player perspective

**Reset:** Set `DEMO_MODE_ACTIVE` back to `false` and redeploy.

> ⚠️ Never deploy to production with `DEMO_MODE_ACTIVE = true`.

---

## 📲 PWA Installation Guide

### Android (Chrome)
1. Open the app URL in Chrome
2. A banner appears: **"Add Avalon to Home screen"**
3. Tap **Install** → App installs as standalone icon
4. Launch from home screen — no browser chrome, full immersive mode

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button (box with arrow)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **Add** → App icon appears on home screen

### Offline Capability
The Service Worker pre-caches the app shell, card assets, and icon assets. The UI functions offline; Firebase sync resumes when connectivity restores.

---

## 🐙 GitHub Source Control & Lifecycle Deployment Workflow

### 1. Git Initialization

```bash
# Initialize repository in project root
cd avalon-pwa/
git init

# Create .gitignore — track assets, ignore OS junk
cat > .gitignore << 'EOF'
# OS System Files
.DS_Store
Thumbs.db
desktop.ini
.AppleDouble
.LSOverride

# Editor Metadata
.vscode/
.idea/
*.swp
*.swo
*~

# Node (if using local dev server)
node_modules/
package-lock.json

# Environment & Secrets (NEVER commit Firebase keys as separate files)
.env
.env.local
*.secret

# Build Artifacts (none expected — single-file architecture)
dist/
build/

# Tracked directories (explicitly include asset folders)
# ./cards/ — TRACKED (version-controlled card art)
# ./icons/ — TRACKED (version-controlled UI tokens)
EOF

# Stage ALL project files (4 files + 2 asset directories)
git add index.html manifest.json sw.js README.md
git add cards/
git add icons/

# Initial commit
git commit -m "feat: initial Avalon PWA — single-file engine with Firebase & PWA support"
```

### 2. GitHub Repository Synchronization

```bash
# Create repository on GitHub (via CLI or browser)
# GitHub CLI method:
gh repo create avalon-pwa --public --description "The Resistance: Avalon — Mobile PWA"

# Or link to existing remote:
git remote add origin https://github.com/YOUR_USERNAME/avalon-pwa.git

# Verify remote
git remote -v

# Push initial commit
git push -u origin main

# Verify upload
gh repo view --web
```

### 3. Safe Single-File Branch Management

This project uses a **two-branch architecture** to isolate production from sandbox testing:

```
main              ← Production branch (DEMO_MODE_ACTIVE = false)
sandbox-staging   ← Validation branch (DEMO_MODE_ACTIVE = true)
```

#### Create the sandbox branch:
```bash
# From main, create sandbox staging branch
git checkout -b sandbox-staging

# Activate demo mode for testing
# In index.html, Section 2:
# const DEMO_MODE_ACTIVE = false;  →  const DEMO_MODE_ACTIVE = true;

# Commit the sandbox flag
git add index.html
git commit -m "sandbox: enable DEMO_MODE_ACTIVE for phase testing"

# Push sandbox branch
git push -u origin sandbox-staging
```

#### Validate on sandbox, then merge to production:
```bash
# After validating all phases in sandbox-staging:
git checkout main

# Cherry-pick non-demo changes (exclude demo flag commits)
git cherry-pick <commit-hash>

# OR merge with flag reset:
git merge sandbox-staging
# Then manually reset DEMO_MODE_ACTIVE to false

git add index.html
git commit -m "fix: reset DEMO_MODE_ACTIVE to false for production"
git push origin main
```

#### Standard development cycle:
```bash
# Always work on sandbox first
git checkout sandbox-staging
git pull origin sandbox-staging

# Make changes, test locally
# ...

git add -A
git commit -m "feat: [describe change]"
git push origin sandbox-staging

# When verified — promote to main
git checkout main
git merge --no-ff sandbox-staging -m "merge: promote validated changes from sandbox"
git push origin main
```

### 4. Automated CDN & Static Hosting via GitHub Pages

#### Enable GitHub Pages (one-time setup):

**Method A — GitHub UI:**
1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **`main`** / Folder: **`/ (root)`**
4. Click **Save**
5. Wait ~60 seconds → App is live at `https://YOUR_USERNAME.github.io/avalon-pwa/`

**Method B — GitHub CLI:**
```bash
gh api repos/:owner/:repo/pages \
  --method POST \
  --field source='{"branch":"main","path":"/"}'
```

#### Automated deployment with GitHub Actions:

Create `.github/workflows/deploy.yml` *(note: this is a workflow config, not an app file)*:

```yaml
name: Deploy Avalon PWA to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Validate DEMO_MODE_ACTIVE is false
        run: |
          if grep -q "const DEMO_MODE_ACTIVE = true" index.html; then
            echo "❌ ERROR: DEMO_MODE_ACTIVE is true. Cannot deploy to production."
            exit 1
          fi
          echo "✅ DEMO_MODE_ACTIVE is false — safe to deploy."

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### HTTPS & Firebase Auth Domain:
After GitHub Pages is active, add your domain to Firebase Auth:
```
Firebase Console → Authentication → Settings → Authorized Domains
→ Add: YOUR_USERNAME.github.io
```

#### Custom Domain (Optional):
```bash
# Create CNAME file in repo root
echo "yourdomain.com" > CNAME
git add CNAME
git commit -m "feat: add custom domain CNAME"
git push origin main
# Then configure DNS A/CNAME records at your registrar
```

#### Service Worker Scope on GitHub Pages:
If hosting in a subdirectory (`/avalon-pwa/`), update `sw.js` and `manifest.json`:
```javascript
// In sw.js — update PRECACHE_URLS base path
const BASE_PATH = '/avalon-pwa';  // or '/' if at root
```
```json
// In manifest.json
{
  "start_url": "/avalon-pwa/",
  "scope": "/avalon-pwa/"
}
```

---

## 🔧 Troubleshooting

### Google Sign-in fails
- Verify the app domain is in Firebase → Auth → Authorized Domains
- Check browser console for CORS/origin errors
- Ensure Firebase config credentials are correct

### Service Worker not updating
```bash
# In Chrome DevTools → Application → Service Workers
# Check "Update on reload" and click "Update"
# Or: bump CACHE_NAME version in sw.js (e.g., avalon-pwa-v1.0.1)
```

### Players can't join rooms
- Verify Firestore rules allow reads/writes
- Check that both host and joiner are on same Firebase project
- Room codes are case-sensitive uppercase (AVL-XXXX format)

### Cards not displaying
- Ensure assets exist at exact paths (`./cards/merlin.png`, etc.)
- Cards are loaded by `<img>` tags; missing assets show placeholder emoji fallbacks
- Use the Admin Panel uploader to inject Base64 assets as an override

### PWA install prompt not appearing
- Must be served over HTTPS (GitHub Pages) or localhost
- Must be visited twice with >5 minute gap (Chrome heuristics)
- Check Lighthouse audit in DevTools for PWA compliance score

### Demo mode stuck
- Ensure `DEMO_MODE_ACTIVE = true` in the script
- Hard-refresh (Ctrl+Shift+R) to bypass Service Worker cache
- Check browser console for JavaScript errors

---

## 📄 License

This application is an unofficial digital companion tool for **The Resistance: Avalon** by Indie Boards & Cards. All game mechanics, role names, and thematic elements are property of their respective rights holders. This implementation is for personal, non-commercial use only.

---

*Built with ⚔️ by a full-stack mobile engineer — single-file PWA architecture, zero build step, maximum immersion.*
