# ⚔️ The Resistance: Avalon — PWA

> A **mobile-first Progressive Web Application** built as a digital companion for the social deduction tabletop game *The Resistance: Avalon*. Features live Firebase multiplayer, immersive role-reveal card animations, circular table seating, blind voting, quest card reveals, and a full Master Admin Control Panel.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Feature Highlights](#feature-highlights)
3. [Workspace File Matrix](#workspace-file-matrix)
4. [Local Asset Specifications](#local-asset-specifications)
5. [Firebase Configuration Guide](#firebase-configuration-guide)
6. [PWA Installation Guide](#pwa-installation-guide)
7. [Demo Mode (Sandbox Testing)](#demo-mode-sandbox-testing)
8. [Game Rules Summary](#game-rules-summary)
9. [Master Admin Panel Reference](#master-admin-panel-reference)
10. [🐙 GitHub Source Control & Lifecycle Deployment Workflow](#-github-source-control--lifecycle-deployment-workflow)
11. [Troubleshooting](#troubleshooting)
12. [License](#license)

---

## Project Overview

This application is a **single-file PWA engine** (`index.html`) that delivers the complete tabletop Avalon experience on mobile devices. All game logic, Firebase synchronization, UI rendering, animation systems, and PWA integration are compiled into the four permitted workspace files.

**Tech Stack:**
- HTML5 + inline CSS with CSS custom properties
- Tailwind CSS via CDN (`@tailwindcss/browser@4`)
- Firebase v10 compat SDK (Auth + Firestore)
- Vanilla JavaScript (ES2022, no build tools required)
- Service Worker API (PWA caching & offline support)
- Google Fonts: Cinzel Decorative, Cinzel, Inter

---

## Feature Highlights

| Feature | Description |
|--------|-------------|
| 🔄 **Live Multiplayer** | Firebase Firestore real-time listeners sync all players instantly |
| 🃏 **3D Role Reveal** | GPU-accelerated CSS card flip animation |
| 🪑 **Circular Seating** | Players positioned radially on an elliptical table canvas |
| 🗳️ **Blind Voting** | Individual votes never exposed — only aggregate tallies shown |
| ⚔️ **Quest Phase** | Card-by-card animated reveal with shuffle animation |
| 🔮 **Merlin/Percival Vision** | Role-aware information rendering at game start |
| ⚠️ **Good-Role Caution** | Pulsing amber warning when Good player selects Fail |
| 📜 **Game Log** | Floating history panel with full event timeline |
| ⚙️ **Admin Panel** | Full master controls for `buenavistaaglinaodanny@gmail.com` |
| 📲 **PWA Gate** | Install-prompt intercepted for non-dismissible install screen |
| 📡 **Disconnect Freeze** | Gameplay frozen with overlay when player drops |
| 👿 **Assassination Phase** | End-game Assassin targeting for Merlin hunt |
| 🌊 **Lady of the Lake** | Optional expansion toggleable by Admin |
| 🖼️ **Card Asset Uploader** | Admin can swap card images with Base64 push to Firebase |
| 🛡️ **Desktop Blockout** | Full-screen portrait enforcement on desktop browsers |

---

## Workspace File Matrix

```
📁 Project Root/
├── index.html         ← Single-file engine (all HTML/CSS/JS compiled)
├── manifest.json      ← PWA configuration (icons, theme, orientation)
├── sw.js              ← Service Worker (cache strategies, offline fallback)
├── README.md          ← This documentation file
│
├── 📁 cards/          ← Character & quest card images (add manually)
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
└── 📁 icons/          ← Board markers, tokens & app icon (add manually)
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

> ⚠️ **PROHIBITION:** No additional files may be added outside this matrix. All logic, styles, and components must remain within the four listed files.

---

## Local Asset Specifications

All image assets must be placed in their exact directories before deployment. The application uses graceful `onerror` fallbacks (emoji icons) when files are missing, so the app functions without images during development.

### Recommended Image Specifications

| Directory | Size | Format | Notes |
|-----------|------|--------|-------|
| `./cards/*.png` | 400×600 px | PNG/WEBP | Portrait card aspect ratio (2:3) |
| `./icons/app_icon.png` | 512×512 px | PNG | Must be maskable for PWA |
| `./icons/*.png` | 96×96 px | PNG | Square tokens with transparency |

### Generating Assets

You may use AI image generators (Midjourney, DALL·E, Stable Diffusion) with a medieval/Arthurian aesthetic using the palette:
- Dark backgrounds: `#11141a`
- Gold accents: `#d4af37`  
- Good faction: `#2a4a8a` to `#5b8dd9`
- Evil faction: `#8b1a1a` to `#e03030`

---

## Firebase Configuration Guide

### Step 1 — Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** → Name it (e.g. `avalon-game`)
3. Disable Google Analytics (optional)
4. Click **Create Project**

### Step 2 — Enable Authentication

1. In your project → **Build → Authentication**
2. Click **Get Started**
3. Enable **Google** provider
4. Add your domain to **Authorized domains**

### Step 3 — Enable Firestore

1. **Build → Firestore Database → Create Database**
2. Select **Production mode** (apply rules below)
3. Choose your nearest region

### Step 4 — Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allow authenticated users to read all rooms
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null
                    && (resource.data.hostUid == request.auth.uid
                        || request.auth.token.email == 'buenavistaaglinaodanny@gmail.com');
    }
  }
}
```

### Step 5 — Get API Credentials

1. Project Settings (gear icon) → **General**
2. Scroll to **Your apps** → **Add app** → Web app (`</>`)
3. Copy the `firebaseConfig` object values

### Step 6 — Enter Credentials in App

On first launch (without stored config), the **Firebase Setup Console** appears.  
Enter each field:

| Field | Example Value |
|-------|--------------|
| API Key | `AIzaSyAbc123…` |
| Auth Domain | `my-avalon.firebaseapp.com` |
| Project ID | `my-avalon` |
| Storage Bucket | `my-avalon.appspot.com` |
| Messaging Sender ID | `123456789012` |
| App ID | `1:123456789012:web:abcdef…` |

Credentials are stored in `localStorage` for subsequent sessions.

---

## PWA Installation Guide

### Android (Chrome)

1. Open the app URL in Chrome
2. The **Install App to Device** gate appears automatically
3. Tap **📲 Install App to Device**
4. Confirm in the browser install dialog

### iOS (Safari)

1. Open the URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll and tap **Add to Home Screen**
4. Tap **Add**

### Desktop Chrome (Development Only)

1. The desktop blockout panel prevents normal use
2. For testing: open DevTools → Application → Manifest → Install

---

## Demo Mode (Sandbox Testing)

Demo Mode is controlled by the constant at the top of the `<script>` block:

```javascript
const DEMO_MODE_ACTIVE = true;  // ← Enable sandbox
const DEMO_MODE_ACTIVE = false; // ← Production mode
```

When `DEMO_MODE_ACTIVE = true`:

- Bypasses Firebase auth and PWA install gate
- Loads 5 pre-configured bot players instantly
- Shows the **purple Developer Control Strip** at the top
- All game phases fully playable locally (no Firebase required)

**Demo Control Strip Features:**

| Control | Function |
|---------|----------|
| Player dropdown | Switch perspective to simulate any player role |
| **⚡ Bot All** | Auto-plays the current game phase |
| **🎮 Start Game** | Jump into demo game as selected player |
| **🔄 Reset** | Reset game state and restart demo |

**Demo Players:**
```
0: Arthur    → Merlin      (Good) — Host / Admin
1: Morgause  → Assassin    (Evil)
2: Galahad   → Percival    (Good)
3: Fay       → Morgana     (Evil)
4: Bedivere  → Loyal Servant (Good)
```

---

## Game Rules Summary

*(Full rules at resistancegame.com — this is an unofficial companion app)*

### Objective
- **Good:** Complete 3 successful quests
- **Evil:** Fail 3 quests, OR have the Assassin identify Merlin after Good wins 3 rounds

### Player Count & Roles

| Players | Good | Evil | Quests (sizes) |
|---------|------|------|----------------|
| 5 | 3 | 2 | 2, 3, 2, 3, 3 |
| 6 | 4 | 2 | 2, 3, 4, 3, 4 |
| 7 | 4 | 3 | 2, 3, 3, 4, 4 |
| 8 | 5 | 3 | 3, 4, 4, 5, 5 |
| 9 | 6 | 3 | 3, 4, 4, 5, 5 |
| 10 | 6 | 4 | 3, 4, 4, 5, 5 |

> **Double Fail Rule:** For 7+ players, Quest 4 requires **2 Fail cards** to fail (not 1).

### Phase Sequence

```
1. ROLE REVEAL     → Each player sees their card privately
2. TEAM SELECTION  → Leader nominates N players for the quest
3. TEAM VOTE       → All players vote Approve/Reject (majority wins)
   ↳ 5 rejections  → Evil wins automatically (vote tracker)
4. QUEST PHASE     → Quest members submit Success/Fail cards secretly
5. QUEST REVEAL    → Leader reveals cards one-by-one
6. REPEAT          → Next leader clockwise; new quest begins
7. ASSASSINATION   → If Good wins 3 quests, Assassin picks Merlin target
8. GAME OVER       → Winner declared
```

### Special Roles

| Role | Team | Special Ability |
|------|------|----------------|
| Merlin | Good | Knows all Evil agents (except Mordred) |
| Percival | Good | Knows who Merlin and Morgana are (not which is which) |
| Loyal Servant | Good | No special information |
| Assassin | Evil | Kills Merlin at game end if Good wins |
| Morgana | Evil | Appears as Merlin to Percival |
| Mordred | Evil | Hidden from Merlin |
| Oberon | Evil | Unknown to other Evil agents |
| Minion of Mordred | Evil | Knows other Evil agents |

---

## Master Admin Panel Reference

**Admin account:** `buenavistaaglinaodanny@gmail.com`

The floating **⚙️ gear button** appears when signed in with the admin Google account.

### Live Match Controls

| Button | Function |
|--------|----------|
| 🔄 Re-open Quest Voting | Resets vote state for current quest team |
| ⏭️ Force Phase Advance | Manually skip to next game phase |
| 🏰 Drop to Lobby | Send all players back to waiting room |
| 💀 Terminate Room | Permanently delete room from Firestore |

### Expansions

- **🌊 Lady of the Lake** — Toggle to enable the expansion where a token passes between rounds, allowing a player to investigate another player's alignment.

### Card Asset Manager

1. Select a card slot from the dropdown (e.g., `merlin.png`)
2. Tap the upload zone to select an image file
3. File is converted to Base64 locally
4. Tap **☁️ Convert & Push to Firebase** to store in Firestore and hot-swap in real-time for all connected players

### Firebase Status Panel

Displays live connection status, room ID, player count, current phase, and score.

---

## 🐙 GitHub Source Control & Lifecycle Deployment Workflow

### 1. Git Initialization

Navigate to your project directory and initialize:

```bash
# Initialize the repository
cd /path/to/your/avalon-project
git init

# Create .gitignore — track cards/ and icons/ directories,
# ignore system & editor files
cat > .gitignore << 'EOF'
# ── System & Editor ──────────────────────────────────────────
.DS_Store
Thumbs.db
*.log
*.tmp
.env
.env.local
.vscode/
.idea/
*.swp
*.swo

# ── Node (if ever used for tooling) ──────────────────────────
node_modules/
npm-debug.log*
yarn-error.log*

# ── Build artifacts ───────────────────────────────────────────
dist/
build/
.cache/

# ── Firebase local emulator data ─────────────────────────────
.firebase/
firebase-debug.log
firestore-debug.log

# ── Local credentials (NEVER commit) ─────────────────────────
firebase-credentials.json
service-account.json
*.pem
*.key

# ── Tracked Directories (explicitly included) ─────────────────
# ./cards/   ← TRACKED (card image assets)
# ./icons/   ← TRACKED (icon & token assets)
# All .png files in these dirs ARE committed to the repository
EOF

# Stage all project files
git add index.html manifest.json sw.js README.md
git add cards/ icons/

# Initial commit
git commit -m "feat: initial Avalon PWA — single-file engine with Firebase multiplayer"
```

### 2. GitHub Repository Synchronization

```bash
# Create a new repository on GitHub first (github.com/new)
# Then link local repo to remote:

git remote add origin https://github.com/YOUR_USERNAME/avalon-pwa.git

# Verify remote
git remote -v

# Push main branch
git push -u origin main

# Confirm files are uploaded correctly
git status
git log --oneline
```

### 3. Safe Single-File Branch Management

This project uses a **two-branch architecture** to separate live production from active development:

```
main              ← Production (DEMO_MODE_ACTIVE = false, live Firebase)
sandbox-staging   ← Development (DEMO_MODE_ACTIVE = true, no Firebase needed)
```

#### Setting Up the Sandbox Branch

```bash
# Create and switch to sandbox branch
git checkout -b sandbox-staging

# In this branch, ensure DEMO_MODE_ACTIVE = true in index.html
# You can use sed to toggle it:
sed -i 's/const DEMO_MODE_ACTIVE = false/const DEMO_MODE_ACTIVE = true/' index.html

# Commit the sandbox config
git add index.html
git commit -m "chore(sandbox): enable DEMO_MODE_ACTIVE for staging branch"

# Push sandbox branch
git push -u origin sandbox-staging
```

#### Workflow: Feature Development

```bash
# Always develop on sandbox-staging
git checkout sandbox-staging

# Make changes, test with DEMO_MODE_ACTIVE = true
# ... edit index.html ...

git add index.html
git commit -m "feat: add [feature name]"
git push origin sandbox-staging

# When ready to promote to production:
git checkout main
git merge sandbox-staging

# Restore DEMO_MODE_ACTIVE = false for production
sed -i 's/const DEMO_MODE_ACTIVE = true/const DEMO_MODE_ACTIVE = false/' index.html

git add index.html
git commit -m "release: promote sandbox changes — disable demo mode for production"
git push origin main
```

#### Branch Protection Rules (Recommended)

In GitHub → Settings → Branches → Add Rule for `main`:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Restrict direct pushes to main

### 4. Automated CDN & Static Hosting via GitHub Pages

GitHub Pages serves the app directly from the repository root via HTTPS with no build step required.

#### Enable GitHub Pages

```bash
# Ensure you're on main branch with DEMO_MODE_ACTIVE = false
git checkout main

# GitHub Pages is configured in the repository settings:
# Repository → Settings → Pages
# Source: Deploy from branch
# Branch: main / (root)
# Click Save
```

#### Configure Custom Domain (Optional)

```bash
# Add a CNAME file to root for custom domain
echo "avalon.yourdomain.com" > CNAME
git add CNAME
git commit -m "feat: configure custom domain for GitHub Pages"
git push origin main
```

Then in your DNS provider, add:
```
CNAME  avalon.yourdomain.com  →  YOUR_USERNAME.github.io
```

#### GitHub Pages URL Structure

Your app will be live at:
```
https://YOUR_USERNAME.github.io/avalon-pwa/
```

> **PWA Note:** For the Service Worker and PWA install prompt to function correctly on GitHub Pages subpath deployments, update the `start_url` in `manifest.json`:
> ```json
> "start_url": "/avalon-pwa/",
> "scope": "/avalon-pwa/"
> ```

#### Verify Deployment

```bash
# Check deployment status
# GitHub → Repository → Actions (if using Actions)
# or GitHub → Repository → Environments → github-pages

# Test PWA installation from live URL
# Chrome DevTools → Application → Manifest
# Should show: "Add to homescreen: Installable"
```

#### Automated Deployment via GitHub Actions (Optional Enhancement)

Create `.github/workflows/deploy.yml` *(note: this is outside the 4-file project matrix and is optional for CI only)*:

```yaml
name: Deploy Avalon PWA to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate required files exist
        run: |
          test -f index.html   && echo "✅ index.html"
          test -f manifest.json && echo "✅ manifest.json"
          test -f sw.js        && echo "✅ sw.js"
          test -f README.md    && echo "✅ README.md"
      - name: Check DEMO_MODE_ACTIVE is false in production
        run: |
          if grep -q "const DEMO_MODE_ACTIVE = true" index.html; then
            echo "❌ ERROR: DEMO_MODE_ACTIVE is true on main branch!"
            exit 1
          fi
          echo "✅ Production mode confirmed"

  deploy:
    needs: validate
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
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

#### Semantic Commit Convention

Use this commit format for clear changelog generation:

```
feat:     New game feature
fix:      Bug fix
chore:    Maintenance (no functional change)
style:    CSS/visual changes
docs:     README / documentation updates
refactor: Code restructuring
release:  Production deployment marker
hotfix:   Critical production fix
```

Examples:
```bash
git commit -m "feat: add Lady of the Lake expansion toggle"
git commit -m "fix: resolve vote overlay not closing on mobile Safari"
git commit -m "style: update Evil faction card border to crimson-mid"
git commit -m "docs: add Firestore security rules to README"
git commit -m "release: v1.2.0 — quest reveal animation, admin uploader"
```

### 5. Release Tagging

```bash
# Tag production releases
git tag -a v1.0.0 -m "Release v1.0.0 — Initial PWA launch"
git push origin v1.0.0

# List all tags
git tag --list

# View tag details
git show v1.0.0
```

---

## Troubleshooting

### Firebase connection errors
- Verify your Firebase credentials in `localStorage` via DevTools → Application → Storage
- Clear stored config: `localStorage.removeItem('avalon_fb_config')` then reload
- Ensure Firestore is in the correct region and rules allow authenticated writes

### PWA Install prompt not appearing
- Must be served over HTTPS (GitHub Pages, Firebase Hosting, or Netlify)
- Chrome requires: valid manifest, registered SW, HTTPS, user engagement
- iOS: Use Safari → Share → Add to Home Screen manually

### Service Worker not updating
- Open DevTools → Application → Service Workers → **Update** or **Unregister**
- Or in Console: `caches.keys().then(k => k.forEach(n => caches.delete(n)))`

### Cards/icons not displaying
- Ensure assets are in exact directories: `./cards/` and `./icons/`
- Check filenames match exactly (case-sensitive on Linux servers)
- Emoji fallbacks are shown automatically when images are missing

### Demo mode stuck
- Click **🔄 Reset** in the Developer Control Strip
- Or open DevTools Console: manually call `startDemoMode()`

### Desktop blockout appearing on tablet
- The blockout triggers at ≥600px landscape or ≥900px viewport width
- Adjust breakpoints in the `@media` rule in the `<style>` block if needed

---

## License

This software is an **unofficial digital companion application** for The Resistance: Avalon. The game design, rules, and intellectual property belong to **Indie Boards & Cards**.

This codebase is released for personal, non-commercial use only.

```
The Resistance: Avalon — PWA Companion
Copyright (c) 2025

Permission is granted for personal and educational use.
Commercial use or redistribution requires explicit permission.
The game "The Resistance: Avalon" is © Indie Boards & Cards.
```

---

*Built with ⚔️ by the Round Table — May your quests succeed and Merlin remain hidden.*
