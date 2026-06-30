# THE RESISTANCE: AVALON - PWA Web Application

A mobile-first, Progressive Web App (PWA) implementation of the popular social deduction game "The Resistance: Avalon". Built with modern web technologies for an immersive tabletop experience on any device.

![Avalon Game](./icons/app_icon.png)

## 🎮 Game Overview

**THE RESISTANCE: AVALON** is a game of social deduction and deception for 5-10 players. Players are secretly assigned roles as either Good (loyal servants of Arthur) or Evil (minions of Mordred). The Good team must complete quests while the Evil team tries to sabotage them without being discovered.

### Key Features
- **Mobile-First Design**: Optimized for portrait mode on smartphones and tablets
- **PWA Enabled**: Install as a native app on iOS and Android devices
- **Real-time Multiplayer**: Firebase-powered synchronization for seamless gameplay
- **Circular Table UI**: Authentic tabletop seating arrangement with radial player positioning
- **Animated Card System**: 60 FPS GPU-accelerated card animations
- **Role Management**: Complete role revelation and secret identity system
- **Admin Controls**: Master admin panel for game management and overrides

---

## 📁 Project Structure

```
avalon-pwa/
├── index.html              # Main application (HTML + CSS + JS)
├── manifest.json           # PWA configuration
├── sw.js                   # Service Worker for offline support
├── README.md               # This documentation file
├── cards/                  # Character & decision card images
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
└── icons/                  # Board markers, tokens & badges
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

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avalon-pwa
   ```

2. **Install a local server** (choose one)
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

### Demo Mode

The application includes a built-in demo mode for testing. Set the following flag in `index.html`:

```javascript
const DEMO_MODE_ACTIVE = true;
```

This bypasses login gates and immediately loads a 5-player game state.

---

## 🔧 Firebase Configuration

### First-Time Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable Authentication (Google provider)

3. Enable Realtime Database

4. Copy your configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com"
   };
   ```

5. Enter credentials in the app's Firebase Setup modal on first launch

### Database Structure

```json
{
  "rooms": {
    "roomId": {
      "players": {
        "playerId": {
          "name": "Player Name",
          "role": "merlin",
          "isConnected": true
        }
      },
      "gameState": {
        "currentLeader": 0,
        "currentMission": 0,
        "phase": "nomination"
      }
    }
  }
}
```

---

## 🐙 GITHUB SOURCE CONTROL & LIFECYCLE DEPLOYMENT WORKFLOW

### 1. Git Initialization

Initialize your local repository with proper `.gitignore` configuration:

```bash
# Navigate to project directory
cd avalon-pwa

# Initialize git repository
git init

# Create .gitignore file
cat > .gitignore << 'EOF'
# System files
.DS_Store
Thumbs.db
desktop.ini

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Local configuration (keep Firebase secrets safe)
firebase-config.local.json
.env

# Logs
*.log
npm-debug.log*

# Cache
.cache/
dist/
build/

# Keep these tracked:
!/cards/
!/icons/
EOF

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Avalon PWA v1.0.0"
```

### 2. GitHub Repository Synchronization

Create a new repository on GitHub, then link your local code:

```bash
# Create remote repository (do this on GitHub UI first)
# Then add as remote
git remote add origin https://github.com/YOUR_USERNAME/avalon-pwa.git

# Verify remote
git remote -v

# Push to main branch
git push -u origin main

# For subsequent pushes
git push origin main
```

### 3. Safe Single-File Branch Management

Implement a multi-branch architecture for safe development:

```bash
# Production branch (stable, deploy-ready)
git checkout -b main
git push -u origin main

# Staging branch (for testing DEMO_MODE_ACTIVE)
git checkout -b sandbox-staging

# Edit index.html for demo mode
# Set: const DEMO_MODE_ACTIVE = true;

git add index.html
git commit -m "Enable demo mode for testing"
git push -u origin sandbox-staging

# Switch between branches
git checkout main      # Production
git checkout sandbox-staging  # Testing

# Merge staging to main after testing
git checkout main
git merge sandbox-staging
git push origin main
```

### Branch Strategy

| Branch | Purpose | DEMO_MODE | Deployment |
|--------|---------|-----------|------------|
| `main` | Production | `false` | GitHub Pages (HTTPS) |
| `sandbox-staging` | Testing | `true` | GitHub Pages (Preview) |
| `feature/*` | Development | N/A | Not deployed |

### 4. Automated CDN & Static Hosting (GitHub Pages)

Configure GitHub Pages for automatic HTTPS deployment:

#### Option A: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
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

#### Option B: Manual GitHub Pages Setup

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Your site will be live at: `https://YOUR_USERNAME.github.io/avalon-pwa/`

#### Enable HTTPS

GitHub Pages automatically provides HTTPS. Verify:
1. Go to **Settings** → **Pages**
2. Ensure **Enforce HTTPS** is enabled (may take a few minutes to activate)

---

## 🎨 Customization

### Color Palette

All colors are defined in CSS custom properties within `index.html`:

```css
:root {
    --charcoal: #11141a;
    --charcoal-light: #1a1f2a;
    --parchment: #f2e6ce;
    --parchment-dark: #d4c4a8;
    --velvet-blue: #2d4a7c;
    --velvet-blue-light: #4a6fa5;
    --crimson: #8b0000;
    --crimson-bright: #c41e3a;
    --gold: #d4af37;
    --gold-light: #f4cf57;
    --gold-dark: #b8941f;
    --amber: #ffbf00;
    --good-green: #2d8f5c;
    --evil-purple: #5c2d8f;
}
```

### Typography

- **Headers**: 'Cinzel Decorative' (medieval serif)
- **Body**: 'Inter' (clean sans-serif)

### GAME_TEXT_CONFIG

All game text, rules, and instructions are centralized in the `GAME_TEXT_CONFIG` object at the top of the `<script>` block in `index.html`. Modify this object to customize:

- App titles and descriptions
- Role descriptions
- Phase names
- Game messages
- Warnings and alerts
- Admin panel labels

---

## 📱 PWA Installation

### On Android

1. Open the app in Chrome
2. Tap the three-dot menu
3. Select "Add to Home screen" or "Install app"
4. Confirm installation

### On iOS (Safari)

1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. Confirm installation

### PWA Features

- **Offline Support**: Service worker caches all assets
- **Push Notifications**: Ready for game invitations (future feature)
- **Background Sync**: Game state synchronization (future feature)
- **App Shortcuts**: Quick access to new game creation

---

## 🛠️ Admin Features

The admin panel is accessible only to `buenavistaaglinaodanny@gmail.com`:

### Admin Capabilities

1. **Toggle Lady of the Lake**: Enable/disable expansion
2. **Re-open Quest Voting**: Reset voting phase
3. **Force Next Phase**: Skip to next game phase
4. **Drop to Lobby**: Return to room selection
5. **Terminate Room**: End current game session

### Accessing Admin Panel

1. Sign in with Google using the admin email
2. A floating gear icon (⚙️) appears in the top-right
3. Click to open admin controls

---

## 🎯 Game Mechanics

### Mission Configuration

| Players | Mission Sizes | Fails Required |
|---------|---------------|----------------|
| 5 | 2, 3, 2, 3, 3 | 1, 1, 1, 2, 1 |
| 6 | 2, 3, 4, 3, 4 | 1, 1, 1, 2, 1 |
| 7 | 2, 3, 3, 4, 4 | 1, 1, 1, 2, 1 |
| 8 | 3, 4, 4, 5, 5 | 1, 1, 1, 2, 1 |
| 9 | 3, 4, 4, 5, 5 | 1, 1, 1, 2, 1 |
| 10 | 3, 4, 4, 5, 5 | 1, 1, 1, 2, 2 |

### Role Distribution

**Good Roles:**
- Merlin (knows all Evil except Oberon)
- Percival (knows Merlin and Morgana)
- Loyal Servants of Arthur

**Evil Roles:**
- Assassin (can kill Merlin after 3 failed quests)
- Morgana (pretends to be Merlin to Percival)
- Mordred (hidden from Merlin)
- Oberon (unknown to other Evil players)
- Minions of Mordred

---

## 🔒 Security Considerations

1. **Firebase Rules**: Configure proper database security rules
2. **Role Secrecy**: Client-side role hiding (server validation recommended for production)
3. **CORS**: Configure allowed origins in Firebase Console
4. **Rate Limiting**: Implement for production deployments

---

## 🐛 Troubleshooting

### PWA Not Installing
- Ensure HTTPS is enabled (required for PWA)
- Check manifest.json is accessible
- Verify service worker registration

### Firebase Connection Issues
- Check Firebase configuration in console
- Verify Authentication providers are enabled
- Check database rules allow read/write

### Demo Mode Not Loading
- Verify `DEMO_MODE_ACTIVE = true` in index.html
- Clear browser cache
- Check console for errors

---

## 📄 License

This project is for educational and personal use. "The Resistance: Avalon" is a trademark of Five Minute Game and published by Days of Wonder.

---

## 🙏 Credits

- **Game Design**: James Ernest & Paul Nicholson (The Resistance), Corey Kondziel (Avalon expansion)
- **Icons & Assets**: Custom designed for this implementation
- **Framework**: Tailwind CSS, Firebase, Vanilla JavaScript

---

## 📞 Support

For issues and feature requests, please open an issue on the GitHub repository.

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**Compatibility**: Modern browsers (Chrome, Safari, Firefox, Edge) with PWA support
