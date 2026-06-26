# ⚔️ The Resistance: Avalon — PWA

A mobile-first Progressive Web App for the social deduction board game **The Resistance: Avalon**. Built as a single-file engine with Firebase Firestore real-time sync, circular table seating, animated card reveals, and a role-based multiplayer game loop.

---

## 📁 Project File Matrix

```
avalon/
├── index.html        ← Single-file app engine (HTML + CSS + JS + Firebase hooks)
├── manifest.json     ← PWA configuration for mobile OS installation
├── sw.js             ← Service Worker: offline caching & background sync
├── README.md         ← This file
├── cards/            ← 12 character & decision card images (PNG)
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
└── icons/            ← 9 board marker, token, and badge images (PNG)
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

> **Strict workspace rule:** No additional files may be added outside this matrix. All logic, styling, and PWA hooks are compiled inside `index.html`.

---

## 🚀 Quick Start

### Demo Mode (No Firebase required)
1. Open `index.html` in any mobile browser (or desktop Chrome DevTools mobile view).
2. The `DEMO_MODE_ACTIVE = true` flag (top of the `<script>` block) auto-populates a 5-player game state.
3. Use the red **⚡ DEMO** strip at the top to switch player perspectives and advance phases.

### Live Mode (Firebase required)
1. Set `const DEMO_MODE_ACTIVE = false;` in `index.html`.
2. Deploy to GitHub Pages (see deployment section below).
3. On first launch, the app shows the Firebase Setup screen — enter your credentials.
4. Credentials are stored in `localStorage` on each device.

---

## 🔥 Firebase Configuration

### Required Firebase Services
- **Firestore Database** — real-time room, player, vote, and quest card sync
- **Authentication** — Google OAuth for admin access

### Firestore Data Structure
```
rooms/
  {roomId}/
    code: "ABCD1"          // 5-char room code
    hostId: "uid"
    players: [...]          // array of player objects
    phase: "nomination"     // current game phase
    roles: { uid: "merlin" }
    nominatedIds: [...]
    currentLeaderIndex: 0
    questIndex: 0
    questResults: []
    voteTrack: 0
    createdAt: timestamp
    votes/
      {uid}/
        vote: "approve"|"reject"
    questCards/
      {uid}/
        card: "success"|"fail"

assets/
  {cardSlot}/
    base64: "data:image/png;base64,..."
    updatedAt: timestamp
```

### Firestore Security Rules (Recommended)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;
      match /votes/{uid} {
        allow read, write: if request.auth.uid == uid;
      }
      match /questCards/{uid} {
        allow read: if false; // leader reveals only
        allow write: if request.auth.uid == uid;
      }
    }
    match /assets/{assetId} {
      allow read: if true;
      allow write: if request.auth.token.email == 'buenavistaaglinaodanny@gmail.com';
    }
  }
}
```

### Admin Access
Sign in with `buenavistaaglinaodanny@gmail.com` to unlock:
- ⚙️ Admin gear FAB (in-game bottom right, above history button)
- Live match controls: Re-open voting, Force phase, Drop to Lobby, Terminate Room
- Lady of the Lake toggle
- Card asset uploader (Base64 → Firebase)
- Player connection log

---

## 🎮 Gameplay Flow

```
Boot → [Firebase Setup] → Login (Guest / Google)
  → Lobby (Room code, role config, wait for 5–10 players)
    → Night Phase (role reveal modal, knowledge shown)
      → Nomination (Leader taps players on circular table)
        → Voting (all players cast blind Approve/Reject)
          → Vote Results (revealed publicly)
            ↳ Rejected: rotate leader, increment vote track (5 = Evil wins)
            ↳ Approved:
              → Quest Phase (team plays Success/Fail cards secretly)
                → Quest Reveal (Leader taps to flip cards one by one)
                  → [3 successes] → Assassin Phase → End
                  → [3 failures] → Evil Wins → End
```

---

## 🛠️ Developer Testing — DEMO MODE

The `#demo-panel` strip at the top of the screen is only visible when `DEMO_MODE_ACTIVE = true`.

| Control | Behaviour |
|---|---|
| Player dropdown | Switches your local player perspective (role, alignment, HUD) |
| **⚡ Bot All** | Auto-fills all missing votes/quest cards for the current phase |
| **→ Phase** | Advances to the next phase intelligently (nominates, votes, reveals) |

Wrap all demo-only code in the clearly labeled comment boundaries:
```js
// === DEMO SANDBOX BOUNDARIES START ===
...
// === DEMO SANDBOX BOUNDARIES END ===
```

---

## 🐙 GITHUB SOURCE CONTROL & LIFECYCLE DEPLOYMENT WORKFLOW

### 1. Git Initialization

```bash
# From the project root
git init
git add .
git commit -m "Initial commit: Avalon PWA engine"
```

**`.gitignore` configuration:**
```gitignore
# System files
.DS_Store
Thumbs.db
*.log
.env
.env.local

# IDE files
.vscode/
.idea/

# Note: track ./cards/ and ./icons/ asset directories
# (do NOT ignore them — card art is part of the deployable package)
```

### 2. GitHub Repository Synchronization

```bash
# Link to a remote repository
git remote add origin https://github.com/YOUR_USERNAME/avalon-pwa.git
git branch -M main
git push -u origin main

# Subsequent pushes
git add .
git commit -m "feat: describe your change"
git push
```

### 3. Multi-Branch Architecture

| Branch | Purpose | `DEMO_MODE_ACTIVE` |
|---|---|---|
| `main` | Production — live Firebase, real gameplay | `false` |
| `sandbox-staging` | Development & UI testing — no Firebase needed | `true` |

```bash
# Create and switch to sandbox branch
git checkout -b sandbox-staging

# Set demo mode for this branch (edit index.html)
# const DEMO_MODE_ACTIVE = true;

git add index.html
git commit -m "chore: enable demo mode for sandbox branch"
git push origin sandbox-staging

# Merge tested changes back to main
git checkout main
git merge sandbox-staging
# Remember to flip DEMO_MODE_ACTIVE = false before pushing main
git push origin main
```

### 4. GitHub Pages Deployment (HTTPS CDN)

GitHub Pages serves the `main` branch root directory directly over HTTPS — no build step needed.

**Setup:**
1. Go to your repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)`
4. Click **Save**

GitHub will publish the app at:
```
https://YOUR_USERNAME.github.io/avalon-pwa/
```

**PWA requirements for GitHub Pages:**
- ✅ HTTPS is served automatically — required for Service Workers
- ✅ `manifest.json` must be at the root — ✓
- ✅ `sw.js` must be at the root scope — ✓
- ✅ `start_url` in manifest uses `./index.html` — ✓

**Automated deployment via GitHub Actions (optional):**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - uses: actions/deploy-pages@v4
```

---

## 🎨 Customization

### Text & Copy
All user-facing strings are in `GAME_TEXT_CONFIG` at the top of the `<script>` block. Edit this object to localize or rebrand without touching any UI or logic code.

### Theme Colors
All colors are defined as CSS custom properties in `:root {}` at the top of the `<style>` block:

```css
--gold:       #d4af37;   /* Critical board elements */
--blue-good:  #2a5fa5;   /* Good faction */
--red-evil:   #8b1a1a;   /* Evil faction */
--parchment:  #f2e6ce;   /* Accent text */
```

### Card Assets
Place PNG files (any resolution, recommended 300×420px for cards) in `./cards/` and `./icons/` using the exact filenames listed in the file matrix above. The engine resolves them by name with `onerror` fallbacks for missing images.

---

## 📱 PWA Notes

- **Portrait-only lock:** A full-screen blockout panel covers desktop viewports (`min-width: 600px`).
- **Install gate:** In live mode (`DEMO_MODE_ACTIVE = false`), the `beforeinstallprompt` event shows a non-dismissible install screen. Once installed, the gate is hidden permanently.
- **Offline support:** The Service Worker caches the app shell and all local assets on install. Firebase calls bypass the cache and always go to the network.
- **iOS (Safari):** The `beforeinstallprompt` event is not fired on iOS. Users must manually add to home screen via the Share menu.

---

## 👥 Player Count Reference

| Players | Good | Evil | Quest sizes (R1–R5) |
|---|---|---|---|
| 5 | 3 | 2 | 2, 3, 2, 3, 3 |
| 6 | 4 | 2 | 2, 3, 4, 3, 4 |
| 7 | 4 | 3 | 2, 3, 3, 4*, 4 |
| 8 | 5 | 3 | 3, 4, 4, 5*, 5 |
| 9 | 6 | 3 | 3, 4, 4, 5*, 5 |
| 10 | 6 | 4 | 3, 4, 4, 5*, 5 |

*Quest 4 requires **2 Fail cards** (not 1) to fail, for 7+ player games.

---

## 📜 License

This app is a companion tool for the board game **The Resistance: Avalon** by Don Eskridge, published by Indie Boards & Cards. This software is an unofficial digital aid and is not affiliated with or endorsed by the publisher. All game rules and mechanics are the intellectual property of their respective owners.
