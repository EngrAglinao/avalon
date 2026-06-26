# ⚔️ AVALON — PWA Web Application

A mobile-first, PWA-enabled digital adaptation of the **Avalon** board game, powered by Firebase Realtime Database and Google Authentication.

---

## 📋 Prerequisites

- A **GitHub account** with a repository set to use **GitHub Pages** (main branch / root)
- A **Firebase project** (free Spark plan is sufficient)
- A modern **Android or iOS smartphone** (Chrome on Android recommended for full PWA install support)
- Basic familiarity with copy-pasting configuration values

---

## 🗂️ File Structure

```
/
├── index.html       ← Complete app (HTML + CSS + JS, no external files)
├── manifest.json    ← PWA manifest (icons, display mode, theme)
├── sw.js            ← Service Worker (caching, offline, routing)
└── README.md        ← This file
```

---

## 🔥 Firebase Console Setup

### Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it `avalon-pwa` (or any name you prefer)
4. Disable Google Analytics (optional) → Click **"Create project"**

---

### Step 2 — Enable Google Authentication

1. In your Firebase project, go to **Build → Authentication**
2. Click **"Get started"**
3. Under the **"Sign-in method"** tab, click **"Google"**
4. Toggle **Enable** → ON
5. Set a **Support email** (your own Gmail)
6. Click **"Save"**

---

### Step 3 — Enable Realtime Database

1. Go to **Build → Realtime Database**
2. Click **"Create database"**
3. Choose your preferred region (e.g., `us-central1`)
4. Start in **"Test mode"** (you will lock it down in Step 4)
5. Click **"Enable"**

---

### Step 4 — Set Realtime Database Security Rules

In **Realtime Database → Rules**, replace the default rules with:

```json
{
  "rules": {
    "config": {
      ".read": "auth != null",
      ".write": "auth.token.email === 'buenavistaaglinaodanny@gmail.com'"
    },
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "rooms": {
      ".read": "auth != null",
      "$roomId": {
        ".write": "auth != null"
      }
    },
    "presence": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

Click **"Publish"**.

---

### Step 5 — Register a Web App & Get Config

1. In your Firebase project overview, click the **Web icon** (`</>`)
2. Register the app with nickname `avalon-web`
3. **Do NOT** check "Firebase Hosting" (you're using GitHub Pages)
4. Click **"Register app"**
5. Copy the **firebaseConfig object** — it looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### Step 6 — Authorize Your GitHub Pages Domain

1. In Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **"Add domain"**
3. Add your GitHub Pages URL: `your-username.github.io`
4. Click **"Add"**

---

## 🚀 Deployment to GitHub Pages

### Option A — Manual (Beginner Friendly)

1. Create a new GitHub repository named `avalon` (or any name)
2. Upload all four files (`index.html`, `manifest.json`, `sw.js`, `README.md`) to the **root** of the **main** branch
3. Go to **Repository Settings → Pages**
4. Under **"Source"**, select **"Deploy from a branch"**
5. Select **Branch: `main`** / **Folder: `/ (root)`**
6. Click **"Save"**
7. Your app will be live at: `https://your-username.github.io/avalon/`

### Option B — Git CLI

```bash
git clone https://github.com/your-username/avalon.git
cd avalon
# Copy your four files into this folder
git add .
git commit -m "Initial AVALON PWA deployment"
git push origin main
```

---

## ⚙️ Pasting Your Firebase Config (Manual Method)

Open `index.html` and locate this section near the top of the `<script>` block:

```javascript
// ─── PASTE YOUR FIREBASE CONFIG HERE ───────────────────────────
const FIREBASE_CONFIG_OVERRIDE = null;
// Replace null with your config object, e.g.:
// const FIREBASE_CONFIG_OVERRIDE = {
//   apiKey: "AIza...",
//   authDomain: "your-project.firebaseapp.com",
//   databaseURL: "https://your-project-default-rtdb.firebaseio.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abc123"
// };
// ────────────────────────────────────────────────────────────────
```

Replace `null` with your config object and save. This bypasses the in-app setup screen entirely.

---

## 📱 Installing the PWA on Your Phone

### Android (Chrome)
1. Open your GitHub Pages URL in **Chrome**
2. The app will display an **"Install App to Device"** screen
3. Tap the **"Install App"** button (triggers the native Chrome install prompt)
4. Tap **"Install"** in the browser's popup
5. The app icon appears on your home screen
6. **Open from home screen** — the app is now in standalone mode
7. Sign in with Google

### iOS (Safari)
1. Open your GitHub Pages URL in **Safari**
2. Tap the **Share button** (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. Open from your home screen

> ⚠️ **Important:** You MUST open the app from the home screen icon (not the browser) for the PWA gate to unlock sign-in.

---

## 👑 Admin Account

The designated admin account is:
```
buenavistaaglinaodanny@gmail.com
```

This account receives:
- Access to the **Admin Settings Panel** (icon, name, character toggles)
- Exclusive **Disconnect Control** dialogue during games
- Ability to terminate or restart sessions

---

## 🎮 Game Rules Quick Reference

| Players | Good | Evil |
|---------|------|------|
| 5       | 3    | 2    |
| 6       | 4    | 2    |
| 7       | 4    | 3    |
| 8       | 5    | 3    |
| 9       | 6    | 3    |
| 10      | 6    | 4    |

**Quest fail requirements:** Most quests fail with 1 Fail card. Quest 4 (with 7+ players) requires 2 Fail cards.

---

## 🔄 State Persistence

If you close the app mid-game:
1. Reopen from your home screen icon
2. The app automatically detects your active session in Firebase
3. You are returned to the exact game phase you left

---

## 🛠️ Troubleshooting

| Problem | Solution |
|--------|----------|
| Install button doesn't appear | Ensure site is served over HTTPS (GitHub Pages does this automatically) |
| Google Sign-In fails | Check that your GitHub Pages domain is added to Firebase Authorized Domains |
| Rooms don't auto-discover | IP detection requires all players on the same Wi-Fi network |
| App shows config screen again | Clear app data in phone settings, then re-enter config |
| QR code not scanning | Ensure camera permissions are granted to the browser |

---

## 🔁 Iteration Prompt

Use this prompt to recreate or modify this exact application:

```
Role: Expert Full-Stack & Mobile Web Developer

Rebuild the AVALON PWA web application with the following exact multi-file structure:
1. index.html — All HTML, CSS, and JavaScript in one file (no external files)
2. manifest.json — PWA manifest with standalone display, dark theme (#1a0a2e), icon paths
3. sw.js — Service worker with install/fetch/activate lifecycle and offline cache
4. README.md — Full Firebase + GitHub Pages deployment guide

Core requirements:
- Mobile/portrait-only lock (block desktop with full-screen overlay)
- PWA install gate before sign-in (detect standalone mode via display-mode or navigator.standalone)
- Firebase Realtime Database for all state (rooms, players, votes, game state)
- Google Sign-In via Firebase Auth
- Admin: buenavistaaglinaodanny@gmail.com (settings panel, disconnect control)
- IP-based room auto-discovery + manual room code + QR code join
- All 8 Avalon roles: Merlin, Percival, Morgana, Mordred, Oberon, Assassin, Loyal Servants, Minions
- Role peek card flip animation with official Avalon aesthetic card designs
- 5-player to 10-player Good/Evil ratio enforcement
- Game phases: Night → Day → Team Vote → Quest → Assassination → End
- Real-time vote status indicators
- Quest board (5 quests, score tracker, leader tracker)
- Disconnect detection via Firebase .info/connected + overlay alerts
- State persistence (return to exact screen on reopen)
- In-game help/guide overlay (contextual by role)
- Dark fantasy Arthurian theme, touch-friendly UI

[MODIFICATION REQUEST]:
[Describe what you want to change or add here]
```

---

## 📄 License

This project is a fan-made digital companion for the **Avalon** board game by Don Eskridge. All game mechanics, role names, and concepts belong to their respective copyright holders. This application is intended for personal, non-commercial use only.
