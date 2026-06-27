# ⚔️ The Resistance: Avalon — PWA Mobile Game Engine

> A fully immersive, Firebase-backed, mobile-first Progressive Web Application for the social deduction board game **The Resistance: Avalon**. Designed with a physical tabletop aesthetic, real-time multiplayer synchronization, and a strict portrait-mode mobile interface.

---

## 📁 Project File Matrix

```
avalon-pwa/
├── index.html          # Single-file game engine (HTML + CSS + JS)
├── manifest.json       # PWA manifest for mobile OS installation
├── sw.js               # Service Worker for offline caching
├── README.md           # This documentation file
├── cards/              # 12 Character & Decision card images
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
└── icons/              # 9 Board tokens, markers & badges
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

## ⚙️ Firebase Configuration

Open `index.html` and locate the clearly commented `FIREBASE CONFIG BLOCK` near the bottom of the `<script>` section. Paste your Firebase project credentials there:

```javascript
// ── FIREBASE CONFIGURATION BLOCK ──────────────────────────────
// Paste your Firebase project config here:
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

### Firebase Services Required
1. **Authentication** — Enable: Email/Password, Google Sign-In
2. **Realtime Database** — Create default database (us-central1 recommended)
3. **Storage** — Enable for card asset uploads via Admin Panel

### Realtime Database Security Rules (Development)
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

### Realtime Database Security Rules (Production)
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "data.child('players').child(auth.uid).exists() || data.child('host').val() === auth.uid",
        ".write": "data.child('players').child(auth.uid).exists() || !data.exists()"
      }
    }
  }
}
```

---

## 🖼️ Card & Icon Assets

Place your card images in `./cards/` and icon images in `./icons/` using the **exact filenames** listed in the file matrix above. The application will automatically detect and render them. Recommended dimensions:

| Asset Type    | Dimensions  | Format |
|---------------|-------------|--------|
| Character Cards | 400×600px | PNG (transparent bg optional) |
| Quest Cards    | 400×600px  | PNG |
| Icon Tokens    | 192×192px  | PNG (transparent bg) |
| App Icon       | 512×512px  | PNG (solid bg for PWA) |

---

## 🐙 GITHUB SOURCE CONTROL & LIFECYCLE DEPLOYMENT WORKFLOW

### 1. Git Initialization

```bash
# Initialize repository in project root
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# OS & System Files
.DS_Store
Thumbs.db
desktop.ini
*.log
*.tmp

# IDE & Editor Files
.vscode/
.idea/
*.swp
*.swo
*~

# Node (if ever used for tooling)
node_modules/
npm-debug.log*

# Environment & Secrets
.env
.env.local
.env.*.local
firebase-debug.log

# Build artifacts
dist/
build/

# Track card and icon assets (DO NOT ignore)
# ./cards/ and ./icons/ are intentionally tracked
EOF

# Stage all allowed project files
git add index.html manifest.json sw.js README.md
git add cards/ icons/

# Initial commit
git commit -m "feat: initial Avalon PWA engine — single-file architecture"
```

### 2. GitHub Repository Synchronization

```bash
# Create repository on GitHub (via GitHub CLI)
gh repo create avalon-pwa --public --description "The Resistance: Avalon — Mobile PWA Game Engine"

# OR link to an existing remote repository:
git remote add origin https://github.com/YOUR_USERNAME/avalon-pwa.git

# Verify remote connection
git remote -v

# Push initial commit to main branch
git push -u origin main
```

### 3. Safe Single-File Branch Management

This project uses a **two-branch architecture** for safe development and production isolation:

```bash
# ── PRODUCTION BRANCH: main ──────────────────────────────────────
# Always contains DEMO_MODE_ACTIVE = false
# Live Firebase credentials active
# Never push untested code directly here

# ── STAGING BRANCH: sandbox-staging ─────────────────────────────
# Create the staging branch from main
git checkout -b sandbox-staging

# In index.html, set: const DEMO_MODE_ACTIVE = true;
# (5-player bot simulation, no Firebase required)

git add index.html
git commit -m "chore(sandbox): enable DEMO_MODE_ACTIVE for visual testing"
git push origin sandbox-staging
```

**Branch Workflow:**

```bash
# Development cycle:
git checkout sandbox-staging        # Work in sandbox
# ... make changes, test visuals, validate phases ...
git add -A && git commit -m "feat: ..."

# Promote to production:
git checkout main
git merge sandbox-staging --no-ff -m "release: promote sandbox changes to production"

# Before merging, always revert demo flag:
# Set DEMO_MODE_ACTIVE = false in index.html
git add index.html
git commit --amend --no-edit

git push origin main
```

### 4. Automated CDN & Static Hosting via GitHub Pages

```bash
# Enable GitHub Pages from repository Settings → Pages
# Source: Deploy from branch → main → / (root)

# OR use GitHub CLI:
gh api repos/YOUR_USERNAME/avalon-pwa/pages \
  --method POST \
  -f source='{"branch":"main","path":"/"}'
```

**GitHub Actions Workflow** — Create `.github/workflows/deploy.yml`:

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
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Validate DEMO_MODE_ACTIVE is false
        run: |
          if grep -q "const DEMO_MODE_ACTIVE = true" index.html; then
            echo "❌ ERROR: DEMO_MODE_ACTIVE is true. Set to false before deploying to production!"
            exit 1
          fi
          echo "✅ DEMO_MODE_ACTIVE = false confirmed."

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
# After setup, your live game URL will be:
# https://YOUR_USERNAME.github.io/avalon-pwa/

# For custom domains, create a CNAME file:
echo "avalon.yourdomain.com" > CNAME
git add CNAME && git commit -m "chore: add custom domain CNAME"
git push origin main
```

---

## 🛠️ Developer Testing (Demo Mode)

To activate the 5-player bot sandbox without Firebase:

1. Open `index.html`
2. Locate: `const DEMO_MODE_ACTIVE = false;`
3. Change to: `const DEMO_MODE_ACTIVE = true;`
4. Open in a mobile browser or Chrome DevTools (portrait mode)
5. The game will auto-populate 5 players and enter an active game state

**Reset to live mode:** Set back to `false` before committing to `main`.

---

## 👑 Admin Access

The Master Admin Panel is accessible to the authenticated Google user:
`buenavistaaglinaodanny@gmail.com`

Admin capabilities:
- Toggle Lady of the Lake expansion
- Upload & hot-swap card artwork (Base64 → Firebase Storage)
- Force-advance game phases
- Re-open quest voting
- Drop all players to lobby
- Terminate & delete active rooms
- View live connection status of all players

---

## 📱 PWA Installation

The app enforces PWA installation on first load (live mode only). Users will see a non-dismissible install prompt. On iOS, they must use **Safari → Share → Add to Home Screen**.

After installation, the game runs in **standalone mode** (full-screen, no browser chrome) and works offline for previously loaded rooms.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Firebase not connecting | Check `FIREBASE_CONFIG` block in `index.html` |
| Cards not showing | Verify exact filenames in `./cards/` directory |
| Install prompt not showing | Must be served over HTTPS (GitHub Pages provides this) |
| Service Worker not updating | Hard refresh: Ctrl+Shift+R or clear SW in DevTools |
| Google Sign-In fails | Add your domain to Firebase Auth → Authorized Domains |

---

## 📜 License

This application is built for personal/private use with the **The Resistance: Avalon** board game. All game mechanics, role names, and thematic elements are intellectual property of Indie Boards & Cards. This PWA is a companion tool, not a commercial product.

---

*Built with ❤️ using Firebase, Tailwind CSS, Vanilla JS, and Web Platform APIs.*
