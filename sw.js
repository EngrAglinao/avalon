# AVALON Mobile PWA

This repository is prepared for a mobile-first, install-gated AVALON web app using Firebase Realtime Database + Firebase Auth.

This repository includes:
- `manifest.json` (PWA manifest)
- `sw.js` (service worker for install/offline shell + lightweight network context checks)
- `index.html` (mobile-first app UI, Firebase flows, room/lobby/game mechanics)
- deployment/setup docs

## 1) Prerequisites

- A Google account
- A Firebase project
- A GitHub repository
- A modern mobile browser (Chrome/Edge/Android WebView/Safari with PWA support caveats)
- HTTPS hosting (GitHub Pages satisfies this)

## 2) Firebase Console Setup

### 2.1 Create project

1. Open Firebase Console: https://console.firebase.google.com
2. Click **Add project** and complete project creation.

### 2.2 Register Web App

1. In Project Overview, click **Web (</>)**.
2. App nickname: `avalon-pwa` (or your choice).
3. Register app.
4. Copy the Firebase config object values (apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId).

### 2.3 Enable Authentication (Google)

1. Go to **Build > Authentication > Sign-in method**.
2. Enable **Google** provider.
3. Add support email.
4. Save.

### 2.4 Enable Realtime Database

1. Go to **Build > Realtime Database**.
2. Click **Create Database**.
3. Choose region nearest your users.
4. Start in locked mode, then apply rules below.

### 2.5 Realtime Database Rules (starter)

Use this as a secure baseline. It allows authenticated users, with explicit admin checks by email to be enforced in app logic.

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "rooms": {
      "$roomId": {
        ".indexOn": ["code", "networkHash", "status", "updatedAt"]
      }
    },
    "profiles": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "appConfig": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

Adjust rules in production to least privilege per path when game schemas are finalized.

## 3) Repository File Layout

Expected architecture:

```text
/
  index.html        (full app UI, styles, game logic)
  manifest.json     (PWA install metadata)
  sw.js             (offline cache + runtime checks)
  README.md         (this file)
  icons/
    icon-192.svg
    icon-512.svg
    maskable-512.svg
```

## 4) PWA file links in `index.html`

Add these in `<head>` of `index.html`:

```html
<link rel="manifest" href="./manifest.json">
<meta name="theme-color" content="#0b1020">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

Register service worker near end of `<body>`:

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}
</script>
```

## 5) Local Hosting

Use any static file server from repository root.

Example (Node):

```bash
npx serve .
```

Open the printed URL on a mobile device connected to the same network.

## 6) Deploy to GitHub `main` + GitHub Pages

1. Initialize git (if needed):

```bash
git init
git add .
git commit -m "feat: add avalon mobile pwa app"
```

2. Create GitHub repo and set remote:

```bash
git branch -M main
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

3. Enable Pages:
- Repo **Settings > Pages**
- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/** (root)
- Save

4. Wait for deployment and open generated Pages URL on mobile.

## 7) Firebase Credentials Injection Strategy

Inside `index.html`, include:

1. `MANUAL_FIREBASE_CONFIG` object for direct pre-deploy paste.
2. First-launch setup form writing config to Realtime Database and local storage fallback.
3. Lock app until config exists and is validated.

## 8) Admin Account

Primary admin email for app logic:

`buenavistaaglinaodanny@gmail.com`

Admin-only controls are enforced in runtime by checking authenticated user email.

## 9) Notes

- GitHub Pages is static hosting; all real-time/game state comes from Firebase services.
- For production, tighten security rules once schema is finalized.
- Add real icon assets under `/icons` to avoid missing manifest icons.