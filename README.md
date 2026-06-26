# ⚔️ AVALON — PWA Web Application

A fully offline-capable, mobile-first Progressive Web App for the social deduction board game *Avalon*, built as a single `index.html` file using Firebase Realtime Database, Firebase Authentication, and vanilla JS.

---

## 📦 Prerequisites

| Tool | Purpose |
|------|---------|
| A Google account | Firebase project creation |
| Firebase project (free Spark plan is sufficient) | Auth + Realtime Database |
| GitHub account | Hosting via GitHub Pages |
| A modern Android or iOS device | Playing the game (handheld-only lock) |
| Chrome (Android) or Safari (iOS) | PWA installation |

---

## 🔥 Firebase Console Setup (Step-by-Step)

### Step 1 — Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it (e.g., `avalon-pwa`)
4. Disable Google Analytics (optional) → Click **"Create project"**

### Step 2 — Register a Web App
1. In your project dashboard, click the **`</>`** (Web) icon
2. Register app with nickname `avalon-web`
3. **Do NOT** check "Firebase Hosting" (you'll use GitHub Pages)
4. Copy the `firebaseConfig` object shown — you'll paste this into the app

### Step 3 — Enable Authentication
1. In left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable:
   - **Google** → Toggle ON → Add your support email → Save
4. Under **Authorized domains**, add:
   - `localhost`
   - `[your-github-username].github.io`

### Step 4 — Create Realtime Database
1. In left sidebar → **Build → Realtime Database**
2. Click **"Create Database"**
3. Choose your nearest region (e.g., `us-central1`)
4. Start in **Test mode** (you'll add rules next)
5. Click **"Enable"**

### Step 5 — Set Database Rules
In the Realtime Database **Rules** tab, paste:

```json
{
  "rules": {
    ".read": "auth != null || true",
    ".write": "auth != null || true",
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    },
    "config": {
      ".read": true,
      ".write": "auth.token.email === 'buenavistaaglinaodanny@gmail.com'"
    },
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
