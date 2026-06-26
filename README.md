# ⚔️ The Resistance: Avalon — Mobile PWA

> **A mobile-first, PWA-enabled digital companion for the board game *The Resistance: Avalon*.**  
> Built as a single-file web application with Firebase real-time sync, offline support, and an immersive medieval UI.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Feature Matrix](#-feature-matrix)
3. [Project File Structure](#-project-file-structure)
4. [Asset Specifications](#️-asset-specifications)
5. [Firebase Configuration](#-firebase-configuration)
6. [Developer Demo Mode](#-developer-demo-mode)
7. [Game Rules Reference](#️-game-rules-reference)
8. [GitHub Source Control & Lifecycle Deployment Workflow](#-github-source-control--lifecycle-deployment-workflow)
9. [PWA Installation Guide](#-pwa-installation-guide)
10. [Admin Panel Reference](#️-master-admin-panel-reference)
11. [Customization Guide](#-customization-guide)
12. [Troubleshooting](#-troubleshooting)
13. [License & Credits](#-license--credits)

---

## 🏰 Project Overview

This app provides a **complete digital tabletop experience** for The Resistance: Avalon for **5–10 players** on mobile devices. It handles:

- **Role distribution** — secretly assigning and revealing character cards
- **Night phase scripting** — automated knowledge reveals per role
- **Team nomination & voting** — blind ballot system with animated results
- **Quest card play** — secret card submission with shuffle/reveal animation
- **Score tracking** — Good vs. Evil quest progress
- **Special mechanics** — Lady of the Lake, Assassination phase
- **Firebase real-time sync** — cross-device multiplayer via Firestore
- **Offline PWA** — installable on iOS/Android for native-like feel

---

## ✅ Feature Matrix

| Feature | Status | Notes |
|---|---|---|
| Mobile Portrait PWA | ✅ | Full-screen on iOS Safari & Android Chrome |
| Firebase Auth (Google) | ✅ | OAuth via Firebase Authentication |
| Guest Play (Nickname) | ✅ | No sign-in required |
| Firebase Firestore Sync | ✅ | Real-time room & game state |
| Circular Table Layout | ✅ | Elliptical player seating, local user at bottom |
| Role Card Flip Animation | ✅ | 3D CSS transform, 60 FPS GPU-accelerated |
| Night Phase Script | ✅ | Auto-populates role-specific intel |
| Team Nomination | ✅ | Leader-only, 3D elevation on nomination |
| Blind Vote System | ✅ | Totals only, individual votes never exposed |
| Quest Card Shuffle + Reveal | ✅ | Animated pile spread, tap-to-reveal |
| Lady of the Lake | ✅ | Admin toggle, alignment reveal mechanic |
| Assassination Phase | ✅ | Auto-triggers when Good wins 3 quests |
| Game History Log | ✅ | Floating parchment scroll button |
| Admin Panel (Admin Email) | ✅ | Full override & Firebase controls |
| Card Asset Uploader | ✅ | Base64 local + Firebase Storage push |
| Disconnect Detection | ✅ | Global freeze banner |
| Developer Demo Mode | ✅ | 5-player sandbox, bot auto-play |
| Service Worker Caching | ✅ | Cache-First static, Network-First API |
| Landscape/Desktop Block | ✅ | Full-screen orientation gate |
| PWA Install Gate | ✅ | beforeinstallprompt intercept |

---

## 📁 Project File Structure

```
avalon-pwa/
│
├── index.html          ← Single-file application engine
│                         (HTML + CSS + JavaScript + PWA hooks)
│
├── manifest.json       ← PWA Web App Manifest
│                         (icons, display mode, orientation lock)
│
├── sw.js               ← Service Worker
│                         (Cache-First/Network-First strategies)
│
├── README.md           ← This documentation file
│
├── cards/              ← Character & Quest card images (12 files)
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
└── icons/              ← Board tokens, badges & app icon (9 files)
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

> **⚠️ STRICT FILE RULE:** Only the 4 files and 2 directories listed above may exist in this workspace. Do not add scripts, stylesheets, or auxiliary assets outside this matrix.

---

## 🖼️ Asset Specifications

### Card Images (`./cards/` — 12 required)

| Filename | Description | Alignment |
|---|---|---|
| `merlin.png` | Merlin role card | Good |
| `percival.png` | Percival role card | Good |
| `good_generic.png` | Loyal Servant of Arthur | Good |
| `good_generic_alt.png` | Loyal Servant (alternate) | Good |
| `assassin.png` | Assassin role card | Evil |
| `morgana.png` | Morgana role card | Evil |
| `mordred.png` | Mordred role card | Evil |
| `oberon.png` | Oberon role card | Evil |
| `evil_generic.png` | Minion of Mordred | Evil |
| `evil_generic_alt.png` | Minion of Mordred (alternate) | Evil |
| `quest_success.png` | Quest Success card | — |
| `quest_fail.png` | Quest Fail/Sabotage card | — |

**Recommended dimensions:** 300×450px (2:3 portrait card ratio)  
**Format:** PNG with transparency support  
**Max file size:** 200KB each (optimize for mobile bandwidth)

### Icon Images (`./icons/` — 9 required)

| Filename | Description | Usage |
|---|---|---|
| `vote_approve.png` | Green approve token | Vote modal |
| `vote_reject.png` | Red reject token | Vote modal |
| `leader_token.png` | Crown/shield leader badge | Player seat badge |
| `quest_marker_good.png` | Blue quest success marker | Quest board pip |
| `quest_marker_evil.png` | Red quest fail marker | Quest board pip |
| `vote_tracker_token.png` | Red consecutive vote token | Vote track |
| `team_shield.png` | Room card icon | Lobby list |
| `lady_token.png` | Lake token | Lady modal |
| `app_icon.png` | App icon (192px + 512px) | PWA manifest, home screen |

**App Icon:** Must be provided in at least `192×192` and `512×512` px square format.

---

## 🔥 Firebase Configuration

### Prerequisites
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in Providers → **Google**
3. Enable **Firestore Database** (start in test mode, add rules before production)
4. Enable **Storage** (for card asset uploads)
5. Add your domain to **Authorized Domains** under Authentication settings

### First-Time Setup
When `index.html` loads without stored credentials, it displays the **Firebase Setup Console**. Enter:

| Field | Where to Find |
|---|---|
| **API Key** | Project Settings → General → Web API Key |
| **Auth Domain** | `[project-id].firebaseapp.com` |
| **Project ID** | Project Settings → General → Project ID |
| **Storage Bucket** | `[project-id].appspot.com` |
| **App ID** | Project Settings → General → Your Apps → App ID |

Credentials are stored in `localStorage` under the key `avalon_firebase_config`.

### Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Rooms: anyone authenticated can read, participants can write
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null
        && resource.data.hostId == request.auth.uid
        || request.auth.uid in resource.data.players[*].id;
      allow delete: if request.auth != null
        && resource.data.hostId == request.auth.uid;
    }

    // Card config: only admin can write
    match /config/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.email == 'buenavistaaglinaodanny@gmail.com';
    }
  }
}
```

### Firestore Data Schema

```
rooms/{roomCode}
  ├── code: string (6-char room code)
  ├── status: "waiting" | "in_progress" | "complete"
  ├── hostId: string
  ├── hostName: string
  ├── createdAt: timestamp
  ├── phase: "LOBBY"|"NIGHT"|"TEAM_SELECT"|"TEAM_VOTE"|"QUEST"|"REVEAL"|"ASSASSIN"|"GAME_OVER"
  ├── playerCount: number (5–10)
  ├── currentLeader: string (player ID)
  ├── currentQuest: number (0–4)
  ├── voteTrack: number (0–4, consecutive rejections)
  ├── goodScore: number
  ├── evilScore: number
  ├── nominations: string[] (player IDs)
  ├── questResults: ("success"|"fail")[]
  ├── winner: "good" | "evil"
  ├── players[]:
  │   ├── id: string
  │   ├── name: string
  │   ├── connected: boolean
  │   └── ready: boolean
  ├── roleAssignments: { [playerId]: roleKey }
  ├── votes: { [playerId]: "approve"|"reject" }
  ├── questCards: { [playerId]: "success"|"fail" }
  ├── revealCards: string[] (shuffled, for animation)
  └── config:
      ├── ladyEnabled: boolean
      └── roles: { percival, morgana, mordred, oberon: boolean }
```

---

## ⚡ Developer Demo Mode

The app ships with `DEMO_MODE_ACTIVE = true` at the top of the `<script>` block, enabling a persistent **Developer Control Strip** (purple bar, `z-index: 99999`).

### Demo Controls

| Control | Function |
|---|---|
| **Player Dropdown** | Switch local perspective between the 5 demo players |
| **⚡ Bot All** | Auto-plays all pending actions for the current phase |
| **⏭ Skip** | Forces phase advancement without input |
| **↺ Reset** | Resets the game to Night Phase with fresh state |
| **Phase Label** | Displays current game phase in real time |

### Demo Players (5-player configuration)

| Slot | Name | Role | Alignment |
|---|---|---|---|
| demo_0 | Merlin | Merlin | Good |
| demo_1 | Percival | Percival | Good |
| demo_2 | Assassin | Assassin | Evil |
| demo_3 | Morgana | Morgana | Evil |
| demo_4 | LoyalServant | Loyal Servant | Good |

### Disabling Demo Mode (Production)
```javascript
// In index.html, change line:
const DEMO_MODE_ACTIVE = true;
// To:
const DEMO_MODE_ACTIVE = false;
```

---

## ⚔️ Game Rules Reference

### Player Count & Team Composition

| Players | Good | Evil | Quest Sizes (Q1–Q5) |
|---|---|---|---|
| 5 | 3 | 2 | 2-3-2-3-3 |
| 6 | 4 | 2 | 2-3-4-3-4 |
| 7 | 4 | 3 | 2-3-3-4-4 |
| 8 | 5 | 3 | 3-4-4-5-5 |
| 9 | 6 | 3 | 3-4-4-5-5 |
| 10 | 6 | 4 | 3-4-4-5-5 |

> **Note:** In games of 7+ players, Quest 4 (index 3) requires **2 Fail cards** to fail.

### Game Phases

1. **🌙 Night Phase** — Eyes closed, roles revealed per script
2. **⚔️ Team Selection** — Leader nominates players for the quest
3. **⚖️ Team Vote** — All players vote Approve/Reject simultaneously
4. **🗺️ Quest** — Nominated players secretly play Success/Fail
5. **📜 Reveal** — Cards shuffled and revealed one by one
6. **🌊 Lady of the Lake** *(optional)* — Alignment reveal after Quest 2+
7. **🗡️ Assassination** — Triggers if Good wins 3 quests and Assassin is in game
8. **👑 Game Over** — Roles revealed, winner announced

### Victory Conditions

- **Good wins:** Complete 3 quests successfully (then survive the Assassination)
- **Evil wins:** Fail 3 quests, OR 5 consecutive team rejections, OR Assassin identifies Merlin

### Role Abilities

| Role | Team | Ability |
|---|---|---|
| **Merlin** | Good | Knows all Evil players (except Mordred) |
| **Percival** | Good | Sees Merlin and Morgana as potential Merlins |
| **Loyal Servant** | Good | No special knowledge |
| **Assassin** | Evil | Can identify and kill Merlin at game end |
| **Morgana** | Evil | Appears as Merlin to Percival |
| **Mordred** | Evil | Hidden from Merlin's sight |
| **Oberon** | Evil | Unknown to other Evil; they don't know Oberon |
| **Minion of Mordred** | Evil | Knows other Evil (except Oberon) |

---

## 🐙 GITHUB SOURCE CONTROL & LIFECYCLE DEPLOYMENT WORKFLOW

### 1. Git Initialization

```bash
# Initialize a new git repository in the project root
git init

# Configure your identity
git config user.name "Your Name"
git config user.email "your@email.com"

# Create the .gitignore file
cat > .gitignore << 'EOF'
# System files
.DS_Store
Thumbs.db
desktop.ini
*.log

# IDE/Editor files
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Local environment
.env
.env.local
*.local

# Node (if ever used for tooling)
node_modules/
npm-debug.log*

# Track ./cards/ and ./icons/ directories (assets are required)
# These directories ARE tracked — do NOT add them to .gitignore
# The lines below are intentionally absent

# Ignore OS cache files inside asset directories
cards/.DS_Store
icons/.DS_Store
EOF

# Stage all allowed project files
git add index.html manifest.json sw.js README.md cards/ icons/

# Verify what will be committed
git status

# Initial commit
git commit -m "feat: initial Avalon PWA — single-file engine with Firebase sync"
```

### 2. GitHub Repository Synchronization

```bash
# Create a new repository on GitHub (via github.com UI or CLI)
# Then link your local repo to the remote:

# Using HTTPS
git remote add origin https://github.com/<your-username>/avalon-pwa.git

# Using SSH (recommended for repeated pushes)
git remote add origin git@github.com:<your-username>/avalon-pwa.git

# Verify remote is set correctly
git remote -v

# Push the initial commit to the main branch
git branch -M main
git push -u origin main

# Future pushes (shorthand after -u is set)
git push
```

### 3. Safe Single-File Branch Management

This project uses a **two-branch architecture**:

| Branch | Purpose | `DEMO_MODE_ACTIVE` |
|---|---|---|
| `main` | Production — served via GitHub Pages | `false` |
| `sandbox-staging` | Development testing & validation | `true` |

```bash
# ── Create the staging branch ──
git checkout -b sandbox-staging

# In index.html, ensure DEMO_MODE_ACTIVE = true (already default)
# Make changes, test, then commit:
git add index.html
git commit -m "test: sandbox with DEMO_MODE_ACTIVE=true — [describe feature]"
git push origin sandbox-staging

# ── Promote staging to production ──
# Switch to main branch
git checkout main

# Merge staging into main (no fast-forward for clean history)
git merge sandbox-staging --no-ff -m "release: promote [feature] to production"

# CRITICAL: Disable demo mode before production push
# Edit index.html: change DEMO_MODE_ACTIVE = true → false
git add index.html
git commit -m "chore: disable DEMO_MODE_ACTIVE for production release"

# Push to main (triggers GitHub Pages redeploy)
git push origin main

# ── Sync staging with main (after production release) ──
git checkout sandbox-staging
git merge main --no-ff -m "chore: sync staging with main post-release"
git push origin sandbox-staging
```

#### Branch Naming Conventions

```
main                        → Production release
sandbox-staging             → Integration testing
feature/[name]              → New feature development (branch from sandbox-staging)
fix/[issue]                 → Bug fixes
hotfix/[name]               → Emergency production fixes (branch from main)
```

#### Recommended Git Workflow (Feature)

```bash
# Start a new feature
git checkout sandbox-staging
git pull origin sandbox-staging
git checkout -b feature/lady-of-the-lake

# Develop and test...
git add index.html
git commit -m "feat: implement Lady of the Lake mechanic with alignment reveal"

# Push feature branch
git push origin feature/lady-of-the-lake

# Open Pull Request on GitHub: feature/lady-of-the-lake → sandbox-staging
# After review and approval, merge via GitHub UI or:
git checkout sandbox-staging
git merge feature/lady-of-the-lake --no-ff
git push origin sandbox-staging
git branch -d feature/lady-of-the-lake
```

### 4. Automated CDN & Static Hosting (GitHub Pages)

GitHub Pages serves the app directly from the repository root over HTTPS — **no build step required**.

#### Setup via GitHub UI

1. Navigate to your repository on **GitHub.com**
2. Click **Settings** → **Pages** (in left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Select branch: **`main`** | Folder: **`/ (root)`**
5. Click **Save**
6. Your app will be live at:  
   `https://<your-username>.github.io/<repository-name>/`

#### Automated Deployment via GitHub Actions

Create `.github/workflows/deploy.yml` *(note: this file is outside the app workspace — it lives in the git metadata folder)*:

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
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Verify DEMO_MODE_ACTIVE is false in production
        run: |
          if grep -q "const DEMO_MODE_ACTIVE = true" index.html; then
            echo "❌ ERROR: DEMO_MODE_ACTIVE is still true! Aborting deployment."
            exit 1
          fi
          echo "✅ Demo mode is disabled. Safe to deploy."

      - name: Validate required asset directories exist
        run: |
          if [ ! -d "cards" ]; then echo "❌ Missing ./cards/ directory!"; exit 1; fi
          if [ ! -d "icons" ]; then echo "❌ Missing ./icons/ directory!"; exit 1; fi
          echo "✅ Asset directories verified."

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Custom Domain (Optional)

```bash
# Create CNAME file in repository root
echo "avalon.yourdomain.com" > CNAME
git add CNAME
git commit -m "chore: add custom domain CNAME"
git push origin main
```

Then configure DNS:
- Add a `CNAME` record pointing `avalon.yourdomain.com` → `<username>.github.io`
- Enable HTTPS in GitHub Pages settings (automatic via Let's Encrypt)

#### Service Worker & HTTPS

> **⚠️ Important:** Service Workers require HTTPS. GitHub Pages automatically provides HTTPS. For local development, use `localhost` (SW works on localhost without HTTPS).

```bash
# Local development server options:
# Option 1: Python (simple)
python3 -m http.server 8080

# Option 2: npx serve (recommended)
npx serve . -p 8080

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

### 5. Commit Message Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature added
fix:      Bug fix
chore:    Maintenance, dependency updates, config
docs:     Documentation changes (README.md)
style:    CSS/visual changes (no logic changes)
refactor: Code restructure without behavior change
test:     Demo mode or test-related changes
release:  Production release promotion
hotfix:   Emergency fix for production issue
```

**Examples:**
```
feat: add Oberon role with blind evil mechanic
fix: resolve vote tally off-by-one on quest 4 double-fail
chore: update cache version to v1.0.1 in sw.js
docs: add Firebase security rules to README
release: v1.2.0 — Lady of the Lake expansion support
hotfix: fix leader token not advancing after 5th rejection
```

---

## 📱 PWA Installation Guide

### Android (Chrome)

1. Open the app URL in **Chrome**
2. A banner will appear: *"Add Avalon to Home Screen"*
3. Tap **Install** → Confirm
4. The app icon appears on your home screen
5. Launch like a native app — no browser chrome!

### iOS (Safari)

1. Open the app URL in **Safari** (Chrome/Firefox on iOS cannot install PWAs)
2. Tap the **Share** button (box with up arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Edit the name if desired → Tap **Add**
5. Launch from the home screen

### Verifying PWA Install

```javascript
// In browser console, check SW registration:
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered SWs:', regs.map(r => r.scope));
});

// Check if running as standalone PWA:
console.log('Standalone?', window.matchMedia('(display-mode: standalone)').matches);
```

---

## ⚙️ Master Admin Panel Reference

The **Admin Panel** is accessible only when signed in as `buenavistaaglinaodanny@gmail.com` via Google Authentication. A floating gear icon (⚙️) appears at the bottom-left of the game screen.

### Admin Controls

| Control | Action |
|---|---|
| **↺ Re-open Quest Voting** | Resets votes and re-opens the vote phase for all players |
| **⏭ Force Phase Advance** | Skips the current phase and advances (bypasses input gates) |
| **🏠 Drop to Lobby** | Returns all players to the lobby, sets room status to "waiting" |
| **💥 Terminate Room** | Permanently deletes the room from Firestore |
| **🌊 Lady of the Lake Toggle** | Enable/disable Lady of the Lake mid-game |
| **🖼️ Card Asset Uploader** | Upload image → Base64 encode → Push to Firebase Storage → Hot-swap |
| **🔥 Edit Firebase Keys** | Navigate to Firebase Setup screen to update credentials |

### Card Asset Upload Flow

1. Select the target card slot from the dropdown (e.g., `merlin.png`)
2. Tap the upload zone to select an image file from device storage
3. Preview the image in the panel
4. Tap **"⬆️ Push to Firebase & Apply"**
5. The app uploads to `firebase-storage/cards/{slot}.png`
6. Retrieves the public download URL
7. Stores the URL in Firestore at `config/cards.{slot}`
8. Updates `GAME.customCardOverrides` — all player views update immediately

---

## 🎨 Customization Guide

### `GAME_TEXT_CONFIG` Object

All user-facing text, role descriptions, quest sizes, and phase labels are isolated in the `GAME_TEXT_CONFIG` constant at the top of the `<script>` block. **Edit this object to customize content without touching UI or game logic.**

```javascript
// Key sections:
GAME_TEXT_CONFIG.appTitle           // Application title
GAME_TEXT_CONFIG.phases             // Phase labels and icons
GAME_TEXT_CONFIG.roles              // Role names, alignments, descriptions
GAME_TEXT_CONFIG.questSizes         // Quest team sizes per player count
GAME_TEXT_CONFIG.evilCounts         // Evil player count per total count
GAME_TEXT_CONFIG.nightScript        // Night phase narration lines
GAME_TEXT_CONFIG.assassinPrompt     // Assassination phase flavor text
GAME_TEXT_CONFIG.goodWin            // Good victory message
GAME_TEXT_CONFIG.evilWin            // Evil victory message
GAME_TEXT_CONFIG.goodCaution        // Warning when Good plays Fail card
```

### CSS Design Tokens

All colors, fonts, and spacing are defined as CSS variables in `:root`:

```css
--bg-deep: #11141a          /* Main background */
--parchment: #f2e6ce        /* Primary text */
--gold: #d4af37             /* Primary accent */
--blue-good: #3b6fce        /* Good team color */
--red-evil: #c0282a         /* Evil team color */
--font-serif: 'Cinzel Decorative', serif   /* Headers */
--font-sans: 'Inter', sans-serif            /* Body text */
```

### Adding New Roles

1. Add role key to `GAME_TEXT_CONFIG.roles`:
```javascript
my_role: { name: 'My Role', align: 'good', desc: 'Description...' }
```
2. Add `./cards/my_role.png` to the `./cards/` directory
3. Add `my_role.png` to the Service Worker's `STATIC_ASSETS` array in `sw.js`
4. Add the role to the relevant upload dropdown in the admin panel HTML

---

## 🔧 Troubleshooting

### Service Worker Not Registering
- Ensure the app is served over HTTPS or from `localhost`
- Check browser console for SW registration errors
- Hard reload: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

### Firebase Connection Failing
- Verify all fields in Firebase Setup are correct (no trailing spaces)
- Check Firebase console → Authentication → Authorized Domains includes your domain
- Check Firestore Rules allow read/write for authenticated users
- Inspect Network tab for failed API calls

### Card Images Not Loading
- Verify files exist in `./cards/` and `./icons/` directories with exact filenames
- Check browser Network tab for 404 errors
- All `img` elements include `onerror` fallbacks (emoji or text)

### Demo Mode Not Starting
- Confirm `const DEMO_MODE_ACTIVE = true;` at the top of `<script>`
- Hard reload the page after editing

### Room Not Found on Join
- Room codes are case-sensitive (always uppercase in the UI)
- Room may have been deleted by admin or timed out
- Check Firestore console for the room document

### Google Sign-In Popup Blocked
- Allow popups for the site in browser settings
- On iOS Safari, ensure popup blocker is disabled for the site

---

## 📄 License & Credits

**Game Design:** Don Eskridge — *The Resistance: Avalon* (© Indie Boards and Cards)  
**Application:** PWA companion app — fan-made digital tool  
**UI Fonts:** [Cinzel Decorative](https://fonts.google.com/specimen/Cinzel+Decorative) & [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts  
**CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) via CDN  
**Backend:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)

> This is an unofficial companion app. *The Resistance: Avalon* is a trademark of Indie Boards and Cards. This software is intended for personal, non-commercial use only.

---

*Last updated: 2025 | Single-file PWA architecture*
