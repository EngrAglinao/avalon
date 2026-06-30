# 🏰 The Resistance: Avalon
### A Mobile-First Progressive Web App

> *Loyalty. Deception. Honor.*

A fully immersive, single-file PWA implementation of the social deduction board game **The Resistance: Avalon** — built for mobile portrait play with Firebase-powered live multiplayer, a strategic bot AI engine, and a master admin control panel.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [File Structure](#-file-structure)
3. [Quick Start](#-quick-start)
4. [Firebase Configuration](#-firebase-configuration)
5. [Demo Mode (Developer Sandbox)](#-demo-mode-developer-sandbox)
6. [Gameplay Guide](#-gameplay-guide)
7. [Admin Panel](#-admin-panel)
8. [PWA Installation](#-pwa-installation)
9. [GitHub Source Control & Lifecycle Deployment Workflow](#-github-source-control--lifecycle-deployment-workflow)
10. [Firestore Security Rules](#-firestore-security-rules)
11. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

| Feature | Details |
|---|---|
| **Architecture** | Single-file HTML engine (`index.html`) + PWA support files |
| **Backend** | Firebase Firestore (real-time sync) + Firebase Auth (Google + Anonymous) |
| **Player Count** | 5–10 players per room |
| **Special Roles** | Merlin, Percival, Morgana, Assassin, Mordred, Oberon |
| **Expansions** | Lady of the Lake (toggleable) |
| **Demo Mode** | Full bot AI engine for offline solo testing |
| **Admin** | Master override panel for `buenavistaaglinaodanny@gmail.com` |

---

## 📁 File Structure

```
avalon/
├── index.html              ← Single-file game engine (HTML + CSS + JS)
├── manifest.json           ← PWA manifest (icons, display, orientation)
├── sw.js                   ← Service Worker (offline caching)
├── README.md               ← This file
│
├── cards/                  ← Character & decision card assets (12 files)
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
└── icons/                  ← Board tokens, markers & app icons (9 files)
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

---

## 🚀 Quick Start

### Option A — GitHub Pages (Recommended)
```bash
# 1. Fork/clone this repository
git clone https://github.com/YOUR_USERNAME/avalon.git
cd avalon

# 2. Add your Firebase config inside index.html (see Firebase section below)
# OR use the in-app Firebase Setup Console on first launch

# 3. Push to GitHub and enable Pages (Settings → Pages → Deploy from main)
# Your app will be live at: https://YOUR_USERNAME.github.io/avalon/
```

### Option B — Local Development Server
```bash
# Requires a local HTTPS or localhost server (PWA needs secure context)
npx serve .
# or
python3 -m http.server 8080
# Then open: http://localhost:8080
```

> ⚠️ **Note:** PWA install prompts and Service Workers only work over HTTPS or `localhost`. For full PWA functionality, deploy to GitHub Pages or similar HTTPS host.

---

## 🔥 Firebase Configuration

### Method 1 — In-App Setup Console
On first launch (when no Firebase config is saved), the app displays a **Firebase Setup Console**. Paste your credentials directly into the fields and tap **Connect Firebase**. Config is saved to `localStorage`.

### Method 2 — Hardcode in index.html
Find the `FIREBASE_CONFIG` block near the top of the `<script>` section in `index.html`:

```javascript
// *** PASTE YOUR FIREBASE CONFIG HERE ***
const FIREBASE_CONFIG = {
  apiKey:      "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain:  "your-project.firebaseapp.com",
  projectId:   "your-project-id",
  appId:       "1:123456789:web:abcdef123456"
};
```

### Firebase Project Setup Steps

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use an existing one)
3. Enable **Authentication** → Sign-in methods:
   - ✅ Anonymous
   - ✅ Google
4. Enable **Firestore Database** (start in test mode, then apply Security Rules below)
5. Copy your web app config from **Project Settings → Your Apps → SDK setup**

---

## 🧪 Demo Mode (Developer Sandbox)

The demo mode lets you test the full game loop solo, without Firebase.

### Enabling Demo Mode
In `index.html`, find and change:
```javascript
const DEMO_MODE_ACTIVE = false;
// Change to:
const DEMO_MODE_ACTIVE = true;
```

### Demo Control Strip Features
When active, a **gold-bordered control strip** pins to the top of the viewport:

| Control | Function |
|---|---|
| **Player slider** (5–10) | Adjusts game size; re-assigns roles dynamically |
| **Lady of the Lake checkbox** | Toggles the Lady expansion for testing |
| **View dropdown** | Switches perspective between You and Bot 1–9 |
| **⚡ Bot Complete** | Advances the current phase using bot AI decisions |
| **▶ Start Game** | Launches a fresh demo game with current settings |
| **↺ Reset** | Resets everything back to lobby state |

### Bot Perspective Switching
The **View dropdown** lets you verify conditional vision rules:

- **Merlin view** — Sees evil players in red (Mordred stays hidden/Good-looking)
- **Percival view** — Sees both Merlin and Morgana highlighted as "Merlin?"
- **Evil view** — Sees Evil allies in red (Oberon is invisible to them and vice versa)

### Bot AI Behavior Summary

**Good Bots:**
- Nominate themselves + trusted (non-failed-quest) players
- Percival targets perceived "Merlin?" candidates
- Merlin strategically avoids always picking only Good players (Assassin radar)
- Approve if on the team, or at Hammer (5th vote); Reject known-evil teams

**Evil Bots:**
- Sneak exactly one Evil ally onto teams (prefer Mordred for deep cover)
- Approve any team with an Evil ally; Reject pure-Good teams
- Coordinate fail cards: only one Evil bot fails per quest (unless alone)

**Assassin Bot:**
- Scores Good players by Merlin likelihood (favors player with most deceptive voting pattern)
- Targets the highest-score Good player for assassination

---

## 🕹️ Gameplay Guide

### Authentication
- **Play as Guest** — Enter a nickname and play immediately
- **Sign in with Google** — Persistent identity; required for admin access

### Hosting a Room
1. Go to **Host Room** tab
2. Toggle **Lady of the Lake** if desired
3. Tap **Create Room** — share the 4-character room code with friends
4. Wait for 5–10 players to join
5. Tap **Start Game** when ready

### Joining a Room
1. Go to **Join Room** tab
2. Enter the host's 4-character code, or tap a room from **Available Rooms**
3. Wait in lobby for the host to start

### Game Phases

#### 🌙 Night Phase
- All players **hold the Reveal button** to see their secret role card
- Special roles see vision indicators over player seats:
  - **Merlin** — Red highlights on Evil seats (Mordred hidden)
  - **Percival** — Blue "?" on Merlin and Morgana
  - **Evil** — Red highlights on Evil allies (Oberon invisible)
- Tap **I'm Ready** when done — game starts when all players are ready

#### 🗳️ Nomination
- The **current Leader** (crown icon) taps player seats to build a team
- Required team sizes are shown on the Quest Board
- Tap **Propose Team** when the right number of players are selected

#### ☑️ Team Vote
- All players **Approve** or **Reject** the proposed team
- **Vote Tracker** advances one pip per rejection
- At **5 rejections** (Hammer), Evil wins automatically
- Majority Approves = Quest begins; Majority Rejects = leadership passes

#### ⚔️ Quest
- Only nominated players submit cards
- **Good players** must play Success (warned if they choose Fail)
- **Evil players** choose Success or Fail
- Cards are shuffled and revealed one-by-one by the Leader

#### 🏆 Quest Tally
- Results show **Success count** and **Fail count** only (individual choices hidden)
- **7+ player games:** Quest 4 requires **2 Fail cards** to fail
- **3 Quest Successes** → Assassin phase (if Assassin in game)
- **3 Quest Failures** → Evil wins

#### 🗡️ Assassin Phase
- Triggered when Good wins 3 quests
- The **Assassin** selects one player to assassinate
- If they choose **Merlin** → Evil wins
- If they miss → **Good wins**

#### 🌊 Lady of the Lake (Optional)
- Activates after Quests 2, 3, and 4
- The token holder investigates one other player — sees **Good or Evil** (true alignment)
- Token passes to the investigated player (cannot pass back to past holders)

---

## ⚙️ Admin Panel

Accessible only to `buenavistaaglinaodanny@gmail.com` (floating ⚙️ button).

| Control | Function |
|---|---|
| **Re-open Voting** | Resets quest card submissions for the current quest |
| **Force Advance** | Skips current phase and moves to next |
| **Drop to Lobby** | Returns all players to the lobby screen |
| **Terminate Room** | Deletes the Firestore room document and ends the session |
| **Lady of the Lake toggle** | Enable/disable Lady mid-session |
| **Card Asset Upload** | Upload a PNG to hot-swap any character or quest card in real time |

### Card Hot-Swap
1. Select the card slot to replace from the dropdown
2. Tap **Upload & Hot-Swap Card**
3. Choose a PNG from your device
4. The image is converted to Base64, pushed to Firestore, and displayed immediately for all players

---

## 📱 PWA Installation

The app shows a **non-dismissible install gate** on first visit (if not already installed as PWA).

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Tap **Add**

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **Install** button in the address bar, or tap the install banner
3. The app installs to your home screen with full-screen portrait mode

### Desktop (Chrome/Edge)
> The app displays a **desktop blockout panel** — it is designed exclusively for mobile portrait. Use DevTools device emulation to test on desktop.

---

## 🐙 GITHUB SOURCE CONTROL & LIFECYCLE DEPLOYMENT WORKFLOW

### 1. Git Initialization

```bash
# Navigate to your project directory
cd avalon

# Initialize Git repository
git init

# Create a .gitignore file
cat > .gitignore << 'EOF'
# System files
.DS_Store
Thumbs.db
desktop.ini
.env
.env.local

# Editor artifacts
.vscode/
.idea/
*.swp
*.swo
*~

# Node (if using local tools)
node_modules/
npm-debug.log*

# Local test files
*.test.html
local-config.js

# DO NOT IGNORE (track these):
# ./cards/   ← All character and quest card assets
# ./icons/   ← All token and badge assets
EOF

# Stage all files (cards/ and icons/ are tracked by default)
git add .

# Initial commit
git commit -m "feat: initial Avalon PWA — single-file engine, Firebase integration, bot AI"
```

---

### 2. GitHub Repository Synchronization

```bash
# Create a new repository on GitHub first (github.com → New Repository)
# Name it: avalon (or your preferred name)
# Do NOT initialize with README (we already have one)

# Link local repo to GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/avalon.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### 3. Safe Single-File Branch Management

This project uses a **two-branch architecture** to separate production from testing:

```
main              ← Production branch (DEMO_MODE_ACTIVE = false)
sandbox-staging   ← Developer testing branch (DEMO_MODE_ACTIVE = true)
```

#### Setting up the sandbox branch

```bash
# Create and switch to sandbox branch
git checkout -b sandbox-staging

# In index.html, change:
#   const DEMO_MODE_ACTIVE = false;
# to:
#   const DEMO_MODE_ACTIVE = true;

# Commit the sandbox version
git add index.html
git commit -m "chore: enable DEMO_MODE for sandbox-staging"

# Push sandbox branch to GitHub
git push -u origin sandbox-staging

# Switch back to main (production always stays at false)
git checkout main
```

#### Feature development workflow

```bash
# Always branch from main for new features
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Make your changes...
git add .
git commit -m "feat: describe your change"

# Push feature branch
git push origin feature/your-feature-name

# Open a Pull Request on GitHub: feature → main
# After review and merge:
git checkout main
git pull origin main

# Sync changes to sandbox
git checkout sandbox-staging
git merge main
# Re-enable DEMO_MODE_ACTIVE = true if it got overwritten
git add index.html
git commit -m "chore: re-enable demo mode after merge"
git push origin sandbox-staging
```

#### Emergency hotfix workflow

```bash
# Branch directly from main for urgent fixes
git checkout main
git checkout -b hotfix/description-of-fix

# Apply fix...
git add .
git commit -m "fix: urgent description"

# Merge back into main immediately
git checkout main
git merge hotfix/description-of-fix
git push origin main

# Clean up
git branch -d hotfix/description-of-fix
```

---

### 4. Automated CDN & Static Hosting via GitHub Pages

GitHub Pages serves the app over HTTPS directly from the repository root — required for PWA and Service Worker support.

#### Enable GitHub Pages

```bash
# On GitHub.com:
# 1. Go to your repository → Settings → Pages
# 2. Under "Source", select: Deploy from a branch
# 3. Branch: main | Folder: / (root)
# 4. Click Save

# Your app will be live at:
# https://YOUR_USERNAME.github.io/avalon/
```

#### Optional: Custom Domain

```bash
# Add a CNAME file to your repo root
echo "avalon.yourdomain.com" > CNAME
git add CNAME
git commit -m "chore: add custom domain CNAME"
git push origin main

# Then configure your domain DNS:
# CNAME record: avalon.yourdomain.com → YOUR_USERNAME.github.io
```

#### Automated Deployment via GitHub Actions

Create `.github/workflows/deploy.yml` for CI/CD:

```yaml
name: Deploy Avalon to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
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

      - name: Verify required files exist
        run: |
          echo "Checking required files..."
          test -f index.html && echo "✅ index.html"
          test -f manifest.json && echo "✅ manifest.json"
          test -f sw.js && echo "✅ sw.js"
          echo "Deployment check passed."

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

```bash
# Add and commit the workflow
mkdir -p .github/workflows
# (paste the YAML above into .github/workflows/deploy.yml)
git add .github/
git commit -m "ci: add GitHub Actions auto-deploy to Pages"
git push origin main
```

Every push to `main` will now automatically deploy to GitHub Pages within ~60 seconds.

#### Sandbox Staging URL (Optional)

To deploy the `sandbox-staging` branch to a preview URL:

```bash
# On GitHub.com:
# Settings → Pages → Source → Change branch to: sandbox-staging
# This replaces the main deploy — use separate repos or Netlify for parallel deploys
```

For parallel production + staging environments, consider:
- **Netlify** — Deploy from `main` and `sandbox-staging` branches simultaneously
- **Vercel** — Automatic preview URLs for every branch push

---

## 🔒 Firestore Security Rules

Apply these rules in **Firebase Console → Firestore → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Rooms: readable by anyone authenticated, writable by room members
    match /rooms/{roomCode} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null
        && (
          // Host can update anything
          resource.data.host == request.auth.uid
          ||
          // Players can update if they're already in the room
          request.auth.uid in resource.data.players.map(p, p.uid)
          ||
          // New player joining (players array grows by 1)
          (
            request.resource.data.players.size() == resource.data.players.size() + 1
            && resource.data.status == 'waiting'
          )
        );
      allow delete: if request.auth != null
        && resource.data.host == request.auth.uid;
    }

  }
}
```

---

## 🛠️ Troubleshooting

### PWA install prompt not appearing
- Must be served over **HTTPS** (GitHub Pages provides this automatically)
- Chrome requires the site to have been visited at least once
- Check `manifest.json` is reachable at `/manifest.json`
- Verify Service Worker registered: DevTools → Application → Service Workers

### Firebase connection errors
- Confirm your `apiKey`, `authDomain`, and `projectId` match your Firebase project
- Check Firestore rules are not blocking reads/writes
- Enable **Anonymous Authentication** in Firebase Console

### Players not seeing each other in the lobby
- Verify Firestore is enabled (not Realtime Database)
- Check browser console for permission errors
- Confirm players are authenticated (even anonymously)

### Cards not loading
- Place card images in `./cards/` relative to `index.html`
- File names must match exactly (case-sensitive on Linux servers):
  - `merlin.png`, `percival.png`, `good_generic.png`, etc.
- Admin card upload tool can hot-swap missing cards via Base64

### Demo mode bot stuck
- Tap **⚡ Bot Complete** to manually advance the bot phase
- If no bots are acting, check that `G.players.some(p => p.isBot)` returns true
- Use **↺ Reset** and **▶ Start Game** to restart cleanly

### Game freezes after disconnect
- Admin can dismiss the disconnect overlay via the ⚙️ panel
- If no admin is present, all players should refresh — the host can recreate the room

---

## 📜 License

This project is a fan implementation of **The Resistance: Avalon** by Don Eskridge / Indie Boards and Cards. All game mechanics, role names, and core rules are the intellectual property of their respective owners. This app is for personal, non-commercial use only.

---

*Built with ❤️ as a single-file PWA — no build tools, no bundlers, just code.*
