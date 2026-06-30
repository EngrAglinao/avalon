# ⚔️ The Resistance: Avalon — Digital Tabletop PWA

> *"The fate of Camelot rests in your hands. Trust no one."*

A **mobile-first Progressive Web App** for the social deduction board game **The Resistance: Avalon**. Built as a single-page application with real-time multiplayer via Firebase Realtime Database, offline-capable via Service Worker caching, and designed exclusively for portrait-mode mobile play.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [File Architecture](#-file-architecture)
3. [Local Development Setup](#-local-development-setup)
4. [Firebase Configuration](#-firebase-configuration)
5. [Demo (Sandbox) Mode](#-demo-sandbox-mode)
6. [Game Rules Reference](#-game-rules-reference)
7. [PWA Installation](#-pwa-installation)
8. [🐙 GitHub Source Control & Lifecycle Deployment Workflow](#-github-source-control--lifecycle-deployment-workflow)
9. [Admin Panel Guide](#-admin-panel-guide)
10. [Asset Directory Specification](#-asset-directory-specification)
11. [Troubleshooting](#-troubleshooting)

---

## 🏰 Project Overview

| Feature | Detail |
|---|---|
| **Platform** | Mobile-First PWA (iOS Safari, Android Chrome) |
| **Orientation** | Portrait-only, locked via `manifest.json` |
| **Players** | 5 – 10 simultaneous players |
| **Backend** | Firebase Realtime Database + Firebase Auth |
| **Offline** | Full Service Worker asset caching (`sw.js`) |
| **Auth** | Guest (nickname) + Google OAuth |
| **Admin** | Exclusive access via `buenavistaaglinaodanny@gmail.com` |

---

## 📁 File Architecture

This workspace is a **strict 4-file matrix**. Do not add additional files at the root level.

```
avalon/
├── index.html          ← Complete app engine (HTML + CSS + JavaScript)
├── manifest.json       ← PWA configuration (portrait lock, icons, theme)
├── sw.js               ← Service Worker (offline caching, push notifications)
├── README.md           ← This documentation file
│
├── cards/              ← Character & decision card images
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
└── icons/              ← Board tokens, badges, and app icon
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

> **IMPORTANT:** The engine inside `index.html` references all assets by these exact paths. Do not rename files or restructure directories.

---

## 🛠️ Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (for local dev server)
- A modern mobile browser or browser DevTools in portrait mobile emulation
- Firebase project (see [Firebase Configuration](#-firebase-configuration))

### Recommended Local Server

Since PWA Service Workers require either `localhost` or HTTPS, use one of these:

**Option A — `live-server` (simplest):**
```bash
npx live-server --port=5500 --host=localhost
```

**Option B — Python HTTP Server:**
```bash
python3 -m http.server 5500
```

**Option C — VS Code [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) Extension:**
Right-click `index.html` → **Open with Live Server**

Then open `http://localhost:5500` on your phone's browser (ensure same Wi-Fi) or use DevTools mobile emulation.

---

## 🔥 Firebase Configuration

### 1. Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Click **Add project** → Name it `avalon-resistance`
3. Disable Google Analytics (optional) → **Create project**

### 2. Enable Services

- **Authentication** → Sign-in method → Enable **Google**
- **Realtime Database** → Create database → **Start in test mode** (then lock with security rules below)

### 3. Security Rules

In Firebase Console → Realtime Database → Rules, paste:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read":  "auth != null || root.child('rooms').child($roomCode).child('phase').val() === 'staging'",
        ".write": "auth != null",

        "players": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },

        "questVotes": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },

        "questCards": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },

        "assets": {
          ".write": "auth != null && auth.token.email === 'buenavistaaglinaodanny@gmail.com'"
        }
      }
    }
  }
}
```

### 4. Register Your App & Get Config

1. Firebase Console → Project Settings → **Add app** → Web (`</>`)
2. Name it `Avalon PWA` → Register
3. Copy the `firebaseConfig` object values
4. In `index.html`, locate the `firebaseConfig` constant and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey:            "YOUR_ACTUAL_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

### 5. Authorize Your Domain

Firebase Console → Authentication → Settings → **Authorized domains** → Add your GitHub Pages domain:
```
yourusername.github.io
```

---

## 🧪 Demo (Sandbox) Mode

The app ships with `DEMO_MODE_ACTIVE = true` at the top of the `<script>` block in `index.html`. In this mode:

- ✅ Firebase is **completely bypassed** — no credentials required
- ✅ 5 simulated bot players are auto-initialized
- ✅ A bright **Developer Sandbox Strip** appears at the top of the screen
- ✅ The **Player Perspective Dropdown** lets you instantly swap between all 5 player views
- ✅ **⚡ Bot All** automatically processes decisions for non-local players
- ✅ **⏭ Phase** force-advances the game to the next phase
- ✅ **🔄 Reset** restarts the demo from the staging room

### Switching to Live Mode

1. Open `index.html`
2. Find this line near the top of the `<script>` block:
   ```javascript
   const DEMO_MODE_ACTIVE = true;
   ```
3. Change it to:
   ```javascript
   const DEMO_MODE_ACTIVE = false;
   ```
4. Ensure your `firebaseConfig` is populated with real values
5. Deploy to HTTPS (GitHub Pages or equivalent)

---

## 🎮 Game Rules Reference

### Factions

| Team | Goal | Roles |
|---|---|---|
| **Good** (Loyal Servants) | Complete 3 quests successfully | Merlin, Percival, Loyal Servants |
| **Evil** (Minions of Mordred) | Fail 3 quests OR assassinate Merlin | Assassin, Morgana, Mordred, Oberon, Minions |

### Player Count & Quest Sizes

| Players | Quest 1 | Quest 2 | Quest 3 | Quest 4* | Quest 5 | Evil Count |
|---|---|---|---|---|---|---|
| 5 | 2 | 3 | 2 | 3 | 3 | 2 |
| 6 | 2 | 3 | 4 | 3 | 4 | 2 |
| 7 | 2 | 3 | 3 | 4 | 4 | 3 |
| 8 | 3 | 4 | 4 | 5 | 5 | 3 |
| 9 | 3 | 4 | 4 | 5 | 5 | 3 |
| 10 | 3 | 4 | 4 | 5 | 5 | 4 |

*Quest 4 requires **2 Fail cards** to fail (for 7+ players)

### Phase Flow

```
Role Reveal → Nominate Team → Vote on Team → [Approved] Quest Action
                 ↑                              ↓
          [Rejected, +vote track]         Quest Reveal
                 ↑                              ↓
          [5 rejections = Evil wins]    [3 Successes → Assassin Phase → End]
                                        [3 Failures → Evil Wins]
```

### Lady of the Lake (Optional Expansion)

When enabled by the admin, the Lady of the Lake token is held by the player to the right of the starting leader. After quests 2, 3, and 4 resolve, the token holder secretly inspects one other player's alignment (Good/Evil) before passing the token to that player. A player cannot use the Lady token if they have already held it.

---

## 📱 PWA Installation

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the menu (⋮) → **Add to Home screen**
3. Or wait for the automatic install banner

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the Share button (□↑)
3. Scroll down → **Add to Home Screen**
4. Tap **Add**

### Desktop (Chrome/Edge)
The app displays a desktop block screen — it is designed exclusively for mobile. Use DevTools portrait emulation for testing.

---

## 🐙 GitHub Source Control & Lifecycle Deployment Workflow

This section guides you through the complete workflow: from initializing your local Git repository to deploying a live PWA over HTTPS via GitHub Pages.

### Step 1: Git Initialization & `.gitignore`

Open your terminal inside the project root folder and initialize the repository:

```bash
# Initialize a new local Git repository
git init

# Configure your identity (first-time setup)
git config user.name  "Your Name"
git config user.email "your.email@example.com"
```

Create a `.gitignore` file to exclude environment noise while explicitly tracking the 4-file matrix and asset directories:

```bash
cat > .gitignore << 'EOF'
# ── Environment & OS Noise ──────────────────────────────────────
.DS_Store
Thumbs.db
desktop.ini
*.log
*.env
.env.*
.env.local
.env.production

# ── Node / Dev Dependencies ─────────────────────────────────────
node_modules/
npm-debug.log*
yarn-error.log*
package-lock.json

# ── Editor Configs ───────────────────────────────────────────────
.vscode/settings.json
.idea/

# ── Build Artifacts ─────────────────────────────────────────────
dist/
build/
.cache/

# ════════════════════════════════════════════════════════════════
# STRICT 4-FILE MATRIX — ALL LISTED FILES MUST BE TRACKED
# ════════════════════════════════════════════════════════════════
# These are EXPLICITLY INCLUDED (not ignored):
# !index.html
# !manifest.json
# !sw.js
# !README.md
# !cards/*.png
# !icons/*.png
EOF
```

Stage and commit the initial state:

```bash
# Stage the complete 4-file matrix
git add index.html manifest.json sw.js README.md

# Stage all card and icon assets
git add cards/
git add icons/

# Verify what's staged
git status

# Create the initial commit
git commit -m "feat: initial Avalon PWA — complete 4-file matrix with card & icon assets"
```

---

### Step 2: GitHub Repository Synchronization

#### Create a New Repository on GitHub

1. Go to [github.com](https://github.com) → Click **+** → **New repository**
2. Name: `avalon-resistance` (or any preferred name)
3. Visibility: **Public** (required for free GitHub Pages)
4. **Do NOT** initialize with README, `.gitignore`, or license (you already have them)
5. Click **Create repository**

#### Link Local Repo to GitHub (HTTPS)

```bash
# Add the remote origin (replace with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/avalon-resistance.git

# Verify the remote was added
git remote -v

# Push to GitHub (this creates the 'main' branch)
git push -u origin main
```

#### Alternative: SSH Protocol (Recommended for secure setups)

```bash
# First, ensure your SSH key is added to GitHub:
# GitHub → Settings → SSH and GPG Keys → New SSH Key

# Add remote via SSH
git remote add origin git@github.com:YOUR_USERNAME/avalon-resistance.git

# Push
git push -u origin main
```

---

### Step 3: Safe Single-File Branch Management

Avalon uses a **two-branch strategy** to separate stable production from active development:

| Branch | Purpose | `DEMO_MODE_ACTIVE` |
|---|---|---|
| `main` | 🏰 **Stable Production** — live multiplayer with Firebase | `false` |
| `sandbox-staging` | 🧪 **Sandbox Development** — local testing with bot players | `true` |

#### Create the Sandbox Branch

```bash
# From main, create and switch to the sandbox branch
git checkout -b sandbox-staging

# Verify you're on the correct branch
git branch
```

On `sandbox-staging`, ensure the demo flag is active:
```javascript
// In index.html (sandbox-staging branch only):
const DEMO_MODE_ACTIVE = true;
```

```bash
# Commit the sandbox configuration
git add index.html
git commit -m "chore(sandbox): enable DEMO_MODE_ACTIVE for local bot testing"

# Push the sandbox branch to GitHub
git push -u origin sandbox-staging
```

#### Working Between Branches

```bash
# Switch back to production main
git checkout main

# Pull latest changes from teammates
git pull origin main

# Merge tested features from sandbox into main
git merge sandbox-staging --no-ff -m "feat: merge sandbox-staging into main"

# Before merging, ALWAYS ensure DEMO_MODE_ACTIVE = false in main
# and firebaseConfig contains live production credentials
```

#### Branch Protection (Recommended)

In GitHub → Your Repo → Settings → Branches → **Add branch protection rule**:

- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Restrict who can push to matching branches

---

### Step 4: GitHub Pages — Automated HTTPS Static Hosting

GitHub Pages serves your PWA directly from the repository over HTTPS — a prerequisite for Service Workers and the PWA install prompt.

#### Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → Scroll to **Pages** (left sidebar)
3. Under **Source** → Select **Deploy from a branch**
4. Branch: `main` | Folder: `/ (root)`
5. Click **Save**

After 1–3 minutes, your app will be live at:
```
https://YOUR_USERNAME.github.io/avalon-resistance/
```

#### Verify the Deployment

```bash
# Check your Pages URL
open https://YOUR_USERNAME.github.io/avalon-resistance/

# Or check deployment status in GitHub:
# Repository → Actions tab → Pages build and deployment
```

#### Continuous Deployment (Every Push = Auto-Deploy)

Every `git push` to `main` automatically triggers a new Pages deployment:

```bash
# Make a change to index.html
# Stage, commit, and push
git add index.html
git commit -m "fix: update quest nomination logic"
git push origin main

# GitHub Actions will automatically rebuild and publish to Pages
# Typical deployment time: 30 seconds to 2 minutes
```

#### Custom Domain (Optional)

1. Purchase a domain (e.g., `avalon-game.app`)
2. In your DNS provider, add a `CNAME` record:
   ```
   Type:  CNAME
   Name:  www
   Value: YOUR_USERNAME.github.io
   ```
3. In GitHub Pages Settings → **Custom domain** → Enter your domain
4. ✅ Check **Enforce HTTPS**

---

### Step 5: Recommended Git Workflow (Feature Development)

```bash
# 1. Start on sandbox-staging
git checkout sandbox-staging
git pull origin sandbox-staging

# 2. Create a feature branch
git checkout -b feature/lady-of-the-lake-animations

# 3. Develop & test locally
#    (use DEMO_MODE_ACTIVE = true for rapid iteration)
npx live-server --port=5500

# 4. Commit changes
git add index.html
git commit -m "feat(lady): add GPU-accelerated token slide animation"

# 5. Push feature branch
git push origin feature/lady-of-the-lake-animations

# 6. Open a Pull Request on GitHub:
#    feature/lady-of-the-lake-animations → sandbox-staging

# 7. After review & testing on sandbox, open PR:
#    sandbox-staging → main
#    (Remember: set DEMO_MODE_ACTIVE = false and update Firebase config)

# 8. Merge to main → Auto-deploys to GitHub Pages
```

---

### Complete Command Reference

```bash
# ── Initial Setup ────────────────────────────────────────────────
git init
git remote add origin https://github.com/USERNAME/avalon-resistance.git
git add .
git commit -m "feat: initial commit"
git push -u origin main

# ── Daily Workflow ───────────────────────────────────────────────
git status                              # Check working tree
git pull origin main                    # Get latest changes
git checkout -b feature/my-feature      # New feature branch
git add index.html                      # Stage specific file
git commit -m "feat: description"       # Commit with message
git push origin feature/my-feature      # Push branch

# ── Branch Management ────────────────────────────────────────────
git branch                              # List local branches
git branch -a                           # List all branches (incl. remote)
git checkout main                       # Switch to main
git checkout sandbox-staging            # Switch to sandbox
git merge sandbox-staging --no-ff       # Merge with commit record
git branch -d feature/my-feature        # Delete merged local branch

# ── Tagging Releases ─────────────────────────────────────────────
git tag -a v1.0.0 -m "Release: v1.0.0 — Initial PWA launch"
git push origin v1.0.0                  # Push tag to GitHub

# ── Emergency Rollback ───────────────────────────────────────────
git log --oneline -10                   # View last 10 commits
git revert HEAD                         # Revert last commit (safe)
git push origin main                    # Deploy the revert
```

---

## ⚙️ Admin Panel Guide

The Admin Panel is accessible exclusively to the account `buenavistaaglinaodanny@gmail.com` via the sidebar "⚙️ Admin Settings" button.

### Admin Controls

| Control | Function |
|---|---|
| **Demo Mode Toggle** | Enable/disable sandbox mode (requires restart) |
| **Lady of the Lake Toggle** | Enable/disable the expansion module before game start |
| **Card Asset Manager** | Upload custom PNG card art; syncs to Firebase for all players |
| **Connection Tree** | Live view of all player connection states |
| **Re-open Quest Voting** | Wipe vote state and reopen ballots for current quest |
| **Force Phase Advance** | Manually advance to the next game phase |
| **Drop All to Lobby** | Return all connected players to the lobby staging room |
| **Terminate Room** | Permanently delete the room from Firebase |

---

## 🖼️ Asset Directory Specification

### ./cards/ — Character Cards (12 Required Files)

| File | Role | Alignment | Recommended Size |
|---|---|---|---|
| `merlin.png` | Merlin | Good | 400×560px |
| `percival.png` | Percival | Good | 400×560px |
| `good_generic.png` | Loyal Servant | Good | 400×560px |
| `good_generic_alt.png` | Loyal Servant (alt) | Good | 400×560px |
| `assassin.png` | Assassin | Evil | 400×560px |
| `morgana.png` | Morgana | Evil | 400×560px |
| `mordred.png` | Mordred | Evil | 400×560px |
| `oberon.png` | Oberon | Evil | 400×560px |
| `evil_generic.png` | Minion of Mordred | Evil | 400×560px |
| `evil_generic_alt.png` | Minion of Mordred (alt) | Evil | 400×560px |
| `quest_success.png` | Success Card | — | 400×560px |
| `quest_fail.png` | Fail Card | — | 400×560px |

### ./icons/ — Token & Badge Assets (9 Required Files)

| File | Purpose | Recommended Size |
|---|---|---|
| `vote_approve.png` | Vote Approve token | 96×96px |
| `vote_reject.png` | Vote Reject token | 96×96px |
| `leader_token.png` | Leader crown badge | 96×96px |
| `quest_marker_good.png` | Quest success marker | 96×96px |
| `quest_marker_evil.png` | Quest fail marker | 96×96px |
| `vote_tracker_token.png` | Vote track token | 96×96px |
| `team_shield.png` | Quest team badge | 96×96px |
| `lady_token.png` | Lady of the Lake token | 96×96px |
| `app_icon.png` | App icon (home screen) | 512×512px |

> **Tip:** Use transparent PNG files for tokens and badges. The app renders them over colored backgrounds. For best results, use square 1:1 images with centered artwork.

---

## 🔧 Troubleshooting

### PWA Install Prompt Not Appearing
- Ensure you are serving over **HTTPS** (GitHub Pages provides this)
- The app must have been visited at least twice
- Check Chrome DevTools → Application → Manifest for errors

### Service Worker Not Registering
- Verify `sw.js` is in the **root directory** (same level as `index.html`)
- Check the browser console for SW registration errors
- In DevTools → Application → Service Workers → check "Update on reload"

### Firebase Authentication Failing
- Confirm your domain is listed in Firebase Console → Authentication → Authorized Domains
- Verify your `firebaseConfig` values match the Firebase Console exactly
- Ensure Google Sign-In is enabled in Firebase Console → Authentication → Sign-in method

### Assets Not Loading (404 errors)
- Verify all files exist in `./cards/` and `./icons/` with exact filenames listed above
- File names are **case-sensitive** on GitHub Pages (Linux servers)
- The app gracefully degrades with emoji fallbacks if images are missing

### Game Stuck on Wrong Phase (Demo Mode)
- Use the **⏭ Phase** button in the developer strip to force-advance
- Click **🔄 Reset** to restart the demo from scratch
- Open browser DevTools Console for error messages

---

## 📝 License

This project is a fan-made digital companion for the physical board game **The Resistance: Avalon** by Don Eskridge / Indie Boards & Cards. This software is created for personal, non-commercial use only. All game mechanics, character names, and thematic elements are property of their respective copyright holders.

---

*Built with ❤️ for Arthurian adventurers everywhere.*
*May your deductions be true and your allies trustworthy.*
