import { useEffect, useRef } from 'react';

// ══════════════════════════════════════════════════════════════
//  THE RESISTANCE: AVALON — Full Game Engine
//  Single-component architecture with injected HTML game shell
// ══════════════════════════════════════════════════════════════

const GAME_HTML = `
<!DOCTYPE html>
<html lang="en" style="height:100%;width:100%;overflow:hidden;background:#11141a;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#11141a" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"><\/script>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    html,body{margin:0;padding:0;background:#11141a;color:#f2e6ce;font-family:'Inter',sans-serif;height:100%;width:100%;overflow:hidden}
    #app{width:100%;height:100dvh;overflow:hidden;position:relative}
    .scroll-y{overflow-y:auto;-webkit-overflow-scrolling:touch}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#d4af37;border-radius:2px}
    .font-cinzel{font-family:'Cinzel Decorative',serif}
    .font-cinzel-base{font-family:'Cinzel',serif}
    .gold-border{border:1.5px solid #d4af37;box-shadow:0 0 8px rgba(212,175,55,0.35)}
    .card-frame{border-radius:10px;border:2px solid #d4af37;box-shadow:0 4px 24px rgba(0,0,0,0.7),0 0 12px rgba(212,175,55,0.3);background:#1a1e2a;overflow:hidden;position:relative}
    .card-frame.evil-frame{border-color:#8b0000;box-shadow:0 4px 24px rgba(0,0,0,0.7),0 0 12px rgba(139,0,0,0.4)}
    .card-img{width:100%;height:100%;object-fit:cover}
    .card-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(160deg,#1a1e2a 0%,#0d1018 100%);color:#f2e6ce;font-family:'Cinzel',serif;padding:8px;text-align:center}
    .btn-gold{background:linear-gradient(135deg,#b8941f 0%,#d4af37 40%,#f0d060 70%,#d4af37 100%);color:#1a0e00;font-family:'Cinzel',serif;font-weight:700;border:none;border-radius:8px;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 12px rgba(212,175,55,0.4);padding:10px 16px}
    .btn-gold:hover{filter:brightness(1.1);transform:translateY(-1px)}
    .btn-gold:active{transform:translateY(0);filter:brightness(0.95)}
    .btn-danger{background:linear-gradient(135deg,#5a0000 0%,#8b0000 50%,#b00000 100%);color:#f2e6ce;font-family:'Cinzel',serif;font-weight:700;border:1px solid #c00;border-radius:8px;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 12px rgba(139,0,0,0.4);padding:10px 16px}
    .btn-good{background:linear-gradient(135deg,#0f2d6b 0%,#1e3a8a 50%,#2a4fa0 100%);color:#a8c4ff;font-family:'Cinzel',serif;font-weight:600;border:1px solid #2a4fa0;border-radius:8px;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 10px rgba(30,58,138,0.4);padding:10px 16px}
    .btn-outline{background:transparent;color:#f2e6ce;border:1.5px solid #d4af37;border-radius:8px;font-family:'Cinzel',serif;font-weight:600;cursor:pointer;transition:all 0.2s;padding:10px 16px}
    .btn-outline:hover{background:rgba(212,175,55,0.1)}
    .avatar-ring{border-radius:50%;border:2px solid #d4af37;box-shadow:0 0 10px rgba(212,175,55,0.35);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;background:linear-gradient(135deg,#1e2430,#11141a);flex-shrink:0;overflow:hidden;position:relative;transition:all 0.3s ease}
    .avatar-ring.evil-ring{border-color:#c00;box-shadow:0 0 10px rgba(200,0,0,0.4)}
    .avatar-ring.selected-ring{border-color:#d4af37;border-width:3px;box-shadow:0 0 20px rgba(212,175,55,0.7);transform:translateY(-8px) scale(1.04)}
    .avatar-ring.dimmed{opacity:0.5}
    .avatar-ring.merlin-seen{border-color:#c00!important;border-width:3px;box-shadow:0 0 16px rgba(200,0,0,0.6)!important}
    .avatar-ring.percival-seen{border-color:#60a5fa!important;border-width:3px;box-shadow:0 0 16px rgba(96,165,250,0.6)!important}
    .avatar-ring.evil-peer{border-color:#c00!important;border-width:3px;box-shadow:0 0 14px rgba(200,0,0,0.5)!important}
    #nightOverlay{position:absolute;inset:0;z-index:500;background:radial-gradient(ellipse at 50% 30%,#0a0c12 0%,#000 100%)}
    .quest-slot{border:1.5px solid #d4af37;border-radius:8px;background:rgba(20,24,35,0.8);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Cinzel',serif}
    .quest-slot.success{border-color:#22c55e;background:rgba(20,60,30,0.6)}
    .quest-slot.fail{border-color:#c00;background:rgba(60,10,10,0.6)}
    .quest-slot.active{border-color:#f0d060;box-shadow:0 0 14px rgba(212,175,55,0.5)}
    .vote-tracker-dot{width:18px;height:18px;border-radius:50%;border:1.5px solid #d4af37;display:flex;align-items:center;justify-content:center}
    .vote-tracker-dot.active{background:#d4af37}
    .vote-tracker-dot.hammer{background:#ff4500;border-color:#ff4500}
    #toastContainer{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:90%}
    .toast{padding:10px 18px;border-radius:8px;font-family:'Inter',sans-serif;font-size:13px;color:#fff;text-align:center;animation:toastIn 0.3s ease,toastOut 0.4s ease 2.8s forwards;max-width:360px}
    .toast.info{background:rgba(30,58,138,0.92);border:1px solid #60a5fa}
    .toast.warn{background:rgba(120,70,0,0.92);border:1px solid #d4af37}
    .toast.error{background:rgba(100,0,0,0.92);border:1px solid #f00}
    .toast.success{background:rgba(10,60,20,0.92);border:1px solid #22c55e}
    @keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes toastOut{from{opacity:1}to{opacity:0}}
    #desktopBlock{display:none;position:fixed;inset:0;z-index:99999;background:#000;align-items:center;justify-content:center;flex-direction:column}
    @media(min-width:900px){#desktopBlock{display:flex}}
    @media(min-width:540px) and (min-height:700px) and (orientation:landscape){#desktopBlock{display:flex}}
    #pwaGate{position:fixed;inset:0;z-index:9998;background:radial-gradient(ellipse at 50% 20%,#1a1e2a 0%,#11141a 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
    #sideNav{position:fixed;top:0;left:-280px;width:280px;height:100dvh;background:#0d1018;border-right:1px solid #d4af37;z-index:800;transition:left 0.3s ease;display:flex;flex-direction:column}
    #sideNav.open{left:0}
    #navBackdrop{position:fixed;inset:0;z-index:799;background:rgba(0,0,0,0.6);display:none}
    #navBackdrop.open{display:block}
    #demoStrip{position:fixed;top:0;left:0;right:0;z-index:9000;background:rgba(0,10,30,0.97);border-bottom:1.5px solid #d4af37;padding:6px 10px;font-family:'Inter',sans-serif;font-size:11px}
    @keyframes pulse-gold{0%,100%{box-shadow:0 0 8px rgba(212,175,55,0.4)}50%{box-shadow:0 0 20px rgba(212,175,55,0.8)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
    .anim-fade{animation:fadeIn 0.4s ease}
    .anim-slide{animation:slideUp 0.4s ease}
    .pulse-gold{animation:pulse-gold 2s infinite}
    .input-gold{background:rgba(255,255,255,0.05);border:1.5px solid #d4af37;border-radius:8px;color:#f2e6ce;padding:10px 14px;font-family:'Inter',sans-serif;font-size:15px;width:100%;outline:none;transition:border-color 0.2s}
    .input-gold:focus{border-color:#f0d060;box-shadow:0 0 10px rgba(212,175,55,0.3)}
    .input-gold::placeholder{color:rgba(242,230,206,0.4)}
    .room-code{font-family:'Cinzel',serif;font-size:28px;font-weight:700;letter-spacing:6px;color:#d4af37}
    .nominate-btn{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;border:1.5px solid rgba(212,175,55,0.4);background:rgba(212,175,55,0.08);cursor:pointer;font-family:'Cinzel',serif;font-size:11px;color:#f2e6ce;transition:all 0.2s}
    .nominate-btn.selected{border-color:#d4af37;background:rgba(212,175,55,0.2)}
    .tab-btn{transition:all 0.2s;border-bottom:2px solid transparent}
    .tab-btn.active{border-bottom-color:#d4af37;color:#d4af37}
    @keyframes warnPulse{0%,100%{background:rgba(120,70,0,0.4)}50%{background:rgba(180,100,0,0.7)}}
    .warn-pulse{animation:warnPulse 1s infinite;border:1.5px solid #d4af37;border-radius:8px;padding:10px}
    #disconnectOverlay{display:none;position:fixed;inset:0;z-index:8000;background:rgba(0,0,0,0.85);align-items:center;justify-content:center}
    #disconnectOverlay.visible{display:flex}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spinner{width:32px;height:32px;border-radius:50%;border:3px solid rgba(212,175,55,0.2);border-top-color:#d4af37;animation:spin 0.8s linear infinite}
  </style>
</head>
<body>
<div id="desktopBlock">
  <div style="text-align:center;padding:32px">
    <div style="font-size:60px">⚔️</div>
    <h1 style="font-family:'Cinzel Decorative',serif;font-size:24px;color:#d4af37;margin:12px 0">The Resistance: Avalon</h1>
    <p style="color:rgba(242,230,206,0.7);font-family:Inter,sans-serif;font-size:14px;line-height:1.6;max-width:280px">
      Designed exclusively for <strong>mobile portrait</strong> screens.<br/>Please open on your smartphone.
    </p>
    <div style="font-size:48px;margin-top:20px">📱</div>
  </div>
</div>

<div id="pwaGate">
  <div style="display:flex;flex-direction:column;align-items:center;gap:24px;text-align:center" class="anim-fade">
    <div style="font-size:64px">⚔️</div>
    <h1 class="font-cinzel" style="font-size:22px;color:#d4af37;line-height:1.3">The Resistance<br/><span style="font-size:16px">Avalon</span></h1>
    <p style="color:rgba(242,230,206,0.65);font-family:Inter,sans-serif;font-size:13px;max-width:280px;line-height:1.6">
      Install the app for offline play, fast loading, and a true tabletop experience.
    </p>
    <div style="width:100%;max-width:300px;display:flex;flex-direction:column;gap:10px">
      <button id="pwaInstallBtn" class="btn-gold pulse-gold" style="width:100%;padding:16px;font-size:15px;border-radius:10px;border:2px solid #f0d060;display:none">📥 Install Avalon App</button>
      <button id="pwaSkipBtn" class="btn-outline" style="width:100%;padding:12px;font-size:13px">Continue in Browser →</button>
    </div>
    <p style="color:rgba(242,230,206,0.3);font-family:Inter,sans-serif;font-size:11px">Version 1.0 · Mobile Portrait Only</p>
  </div>
</div>

<div id="navBackdrop" onclick="closeNav()"></div>
<div id="sideNav">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid rgba(212,175,55,0.3)">
    <span class="font-cinzel-base" style="color:#d4af37;font-size:13px">⚔️ Avalon</span>
    <button onclick="closeNav()" style="background:none;border:none;color:rgba(242,230,206,0.6);font-size:20px;cursor:pointer">✕</button>
  </div>
  <div id="sideNavContent" style="flex:1;overflow-y:auto;padding:16px" class="scroll-y"></div>
  <div style="padding:16px;border-top:1px solid rgba(212,175,55,0.2)">
    <button id="navSignOutBtn" onclick="handleSignOut()" class="btn-danger" style="width:100%;padding:8px;font-size:12px;display:none">Sign Out</button>
  </div>
</div>

<div id="demoStrip" style="display:none">
  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
    <span style="color:#d4af37;font-weight:bold;font-size:11px">🛠 DEMO</span>
    <label style="color:rgba(242,230,206,0.8);font-size:11px;display:flex;align-items:center;gap:4px">
      👥 <input id="demoPlayerSlider" type="range" min="5" max="10" value="6" style="width:70px;accent-color:#d4af37" />
      <span id="demoPlayerCount" style="color:#d4af37;font-weight:bold">6</span>P
    </label>
    <label style="color:rgba(242,230,206,0.8);font-size:11px;display:flex;align-items:center;gap:4px">
      <input id="demoLakeCheck" type="checkbox" style="accent-color:#d4af37" /> Lady
    </label>
    <select id="demoPerspective" style="background:#0d1018;border:1px solid #b8941f;color:#f0d060;font-size:11px;border-radius:4px;padding:1px 4px"></select>
    <button id="demoBotBtn" style="background:rgba(212,175,55,0.7);color:#000;font-size:11px;font-weight:bold;border:none;border-radius:4px;padding:2px 8px;cursor:pointer">⚡ Bot</button>
    <button id="demoRestartBtn" style="background:rgba(139,0,0,0.7);color:#fca5a5;font-size:11px;font-weight:bold;border:none;border-radius:4px;padding:2px 8px;cursor:pointer">↺ Restart</button>
  </div>
</div>

<div id="app">
  <div id="viewAuth" style="display:none;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:24px;gap:20px"></div>
  <div id="viewLobby" style="display:none;flex-direction:column;height:100%"></div>
  <div id="viewRoom" style="display:none;flex-direction:column;height:100%"></div>
  <div id="viewGame" style="display:none;flex-direction:column;height:100%;position:relative"></div>
  <div id="viewEnd" style="display:none;flex-direction:column;height:100%"></div>
</div>

<div id="nightOverlay" style="display:none"></div>
<div id="disconnectOverlay"><div style="background:#161b26;border:1px solid #c00;border-radius:12px;padding:24px;margin:16px;text-align:center"><p id="disconnectMsg" style="color:#f2e6ce;font-family:Cinzel,serif;font-size:14px"></p></div></div>
<div id="toastContainer"></div>

<div id="adminModal" style="display:none;position:fixed;inset:0;z-index:8500;background:rgba(0,0,0,0.85);overflow-y:auto">
  <div style="min-height:100%;display:flex;align-items:flex-start;justify-content:center;padding:16px;padding-top:32px">
    <div style="background:#161b26;border:1px solid #b8941f;border-radius:12px;width:100%;max-width:340px;padding:20px" class="anim-slide">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <span class="font-cinzel" style="color:#d4af37;font-size:14px">⚙️ Admin Panel</span>
        <button onclick="closeAdmin()" style="background:none;border:none;color:rgba(242,230,206,0.6);font-size:20px;cursor:pointer">✕</button>
      </div>
      <div id="adminContent"></div>
    </div>
  </div>
</div>

<script>
// ═══════════════════════════════════════════════════
//  DEVELOPER FLAGS
// ═══════════════════════════════════════════════════
const DEMO_MODE_ACTIVE = false;

// ═══════════════════════════════════════════════════
//  FIREBASE CONFIG  ← Paste your credentials here
// ═══════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// ═══════════════════════════════════════════════════
//  GAME TEXT CONFIG  (all copy isolated here)
// ═══════════════════════════════════════════════════
const GAME_TEXT_CONFIG = {
  appTitle: "The Resistance: Avalon",
  appSubtitle: "A Game of Hidden Identities & Secret Missions",
  phases: {
    NIGHT:"Night Phase",NOMINATION:"Quest Nomination",TEAM_VOTE:"Team Vote",
    QUEST_VOTE:"Quest in Progress",REVEAL:"Quest Results",
    LADY:"Lady of the Lake",ASSASSIN:"Assassination Phase",END:"Game Over"
  },
  roles: {
    merlin:{name:"Merlin",align:"good",icon:"🧙"},
    percival:{name:"Percival",align:"good",icon:"🛡️"},
    good_generic:{name:"Loyal Servant",align:"good",icon:"⚔️"},
    assassin:{name:"Assassin",align:"evil",icon:"🗡️"},
    morgana:{name:"Morgana",align:"evil",icon:"🌑"},
    mordred:{name:"Mordred",align:"evil",icon:"💀"},
    oberon:{name:"Oberon",align:"evil",icon:"👁️"},
    evil_generic:{name:"Minion of Mordred",align:"evil",icon:"🔺"},
  },
  roleVision: {
    merlin:"You can see all Evil agents — EXCEPT Mordred. Keep your identity secret from the Assassin.",
    percival:"You can see Merlin and Morgana — but cannot tell them apart. Find the true Merlin.",
    good_generic:"You know nothing of others' identities. Trust your instincts and observe carefully.",
    assassin:"You know all Evil allies (except Oberon). If Good wins 3 quests, assassinate Merlin.",
    morgana:"You appear as Merlin to Percival. Sow confusion. You know your Evil allies (except Oberon).",
    mordred:"You are hidden from Merlin. You know your Evil allies (except Oberon). A great asset.",
    oberon:"You are Evil, but unknown to your allies — and they are unknown to you. Act alone.",
    evil_generic:"You know all Evil allies (except Oberon). Subtly sabotage quests and avoid detection.",
  },
  ui: {
    holdReveal:"Hold to Reveal Your Role",readyBtn:"✅ Ready to Wake Up",
    voteApprove:"✅ APPROVE",voteReject:"❌ REJECT",
    goodWarnMsg:"⚠️ Caution: You are registered as a Good Role. Think carefully before failing this quest.",
    assassinPrompt:"Choose the player you believe is Merlin and assassinate them.",
    ladyPrompt:"Choose a player to investigate their true alignment.",
  },
  questSizes:{5:[2,3,2,3,3],6:[2,3,4,3,4],7:[2,3,3,4,4],8:[3,4,4,5,5],9:[3,4,4,5,5],10:[3,4,4,5,5]},
  twoFailRequired:{7:3,8:3,9:3,10:3},
  roleSets:{
    5:['merlin','percival','good_generic','morgana','assassin'],
    6:['merlin','percival','good_generic','good_generic','morgana','assassin'],
    7:['merlin','percival','good_generic','good_generic','morgana','assassin','oberon'],
    8:['merlin','percival','good_generic','good_generic','good_generic','morgana','assassin','evil_generic'],
    9:['merlin','percival','good_generic','good_generic','good_generic','good_generic','morgana','assassin','mordred'],
    10:['merlin','percival','good_generic','good_generic','good_generic','good_generic','morgana','assassin','mordred','oberon'],
  },
};

// ═══════════════════════════════════════════════════
//  GLOBAL STATE
// ═══════════════════════════════════════════════════
const GS={
  user:null,isAdmin:false,fb:null,auth:null,db:null,
  roomCode:null,isHost:false,players:[],myIndex:0,
  myRole:null,roles:[],
  phase:'SETUP',currentQuest:0,currentLeader:0,voteTracker:0,
  questResults:[],nominatedSeats:[],teamVotes:{},questCards:[],
  revealedCards:[],ladyHolder:null,ladyHistory:[],assassinTarget:null,
  demoPlayers:6,demoLake:false,demoPerspective:0,
  myNightReady:false,myVote:null,myQuestCard:null,
  notepadFlags:[],gameLog:[]
};

// ═══════════════════════════════════════════════════
//  PWA INSTALL
// ═══════════════════════════════════════════════════
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',(e)=>{
  e.preventDefault();deferredPrompt=e;
  const btn=document.getElementById('pwaInstallBtn');if(btn)btn.style.display='block';
});
document.getElementById('pwaInstallBtn').addEventListener('click',async()=>{
  if(!deferredPrompt)return;deferredPrompt.prompt();
  const{outcome}=await deferredPrompt.userChoice;deferredPrompt=null;
  if(outcome==='accepted')hidePwaGate();
});
document.getElementById('pwaSkipBtn').addEventListener('click',hidePwaGate);
function hidePwaGate(){const g=document.getElementById('pwaGate');if(g)g.style.display='none';initApp();}
if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone){
  document.getElementById('pwaGate').style.display='none';setTimeout(initApp,100);
}

// ═══════════════════════════════════════════════════
//  FIREBASE
// ═══════════════════════════════════════════════════
function initFirebase(){
  try{
    if(!firebaseConfig.apiKey){console.warn('[FB] No config');return false;}
    if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);
    GS.fb=firebase;GS.auth=firebase.auth();GS.db=firebase.database();return true;
  }catch(e){console.error('[FB]',e);return false;}
}

// ═══════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════
function showToast(msg,type='info',duration=3200){
  const c=document.getElementById('toastContainer');if(!c)return;
  const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;
  c.appendChild(t);setTimeout(()=>{try{c.removeChild(t);}catch(e){}},duration);
}

// ═══════════════════════════════════════════════════
//  VIEW SWITCHER
// ═══════════════════════════════════════════════════
const VIEWS=['viewAuth','viewLobby','viewRoom','viewGame','viewEnd'];
function showView(id){
  VIEWS.forEach(v=>{
    const el=document.getElementById(v);
    if(!el)return;
    el.style.display=(v===id)?'flex':'none';
    if(v===id)el.style.flexDirection='column';
  });
  const n=document.getElementById('nightOverlay');if(n)n.style.display='none';
  renderSideNav();
}

// ═══════════════════════════════════════════════════
//  SIDE NAV
// ═══════════════════════════════════════════════════
function openNav(){document.getElementById('sideNav').classList.add('open');document.getElementById('navBackdrop').classList.add('open');renderSideNav();}
function closeNav(){document.getElementById('sideNav').classList.remove('open');document.getElementById('navBackdrop').classList.remove('open');}
function renderSideNav(){
  const c=document.getElementById('sideNavContent');if(!c)return;
  const sb=document.getElementById('navSignOutBtn');
  const inGame=GS.phase!=='SETUP'&&GS.phase!=='LOBBY';
  if(sb)sb.style.display=(GS.user&&!GS.user.isGuest&&!inGame)?'block':'none';
  if(inGame){
    let h='<p style="font-family:Cinzel,serif;color:#d4af37;font-size:12px;margin-bottom:8px">📓 Investigation Notepad</p>';
    GS.players.forEach((p,i)=>{
      const f=GS.notepadFlags[i]||'neutral';
      const fc={good:'#60a5fa',evil:'#f87171',neutral:'rgba(242,230,206,0.4)'};
      const fi={good:'🔵',evil:'🔴',neutral:'⬜'};
      const isMe=i===GS.myIndex;
      h+=\`<div style="display:flex;align-items:center;gap:8px;padding:4px 0">
        <button onclick="cycleFlag(\${i})" style="font-size:18px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid rgba(212,175,55,0.3);background:none;cursor:pointer">\${fi[f]}</button>
        <span style="font-size:14px;color:\${fc[f]}\${isMe?';font-weight:bold':''}">\${p.name}\${isMe?' (You)':''}</span>
      </div>\`;
    });
    h+='<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(212,175,55,0.2)"><p style="color:rgba(242,230,206,0.3);font-size:10px;font-family:Inter,sans-serif">Tap to cycle: ⬜→🔵→🔴</p></div>';
    c.innerHTML=h;
  } else {
    const n=GS.user?GS.user.name:'—';
    c.innerHTML=\`<div style="text-align:center;padding:12px 0">
      <div class="avatar-ring" style="width:48px;height:48px;margin:0 auto;font-size:18px">\${n.charAt(0).toUpperCase()}</div>
      <p style="font-family:Cinzel,serif;color:#d4af37;font-size:13px;margin:8px 0 2px">\${n}</p>
      <p style="color:rgba(242,230,206,0.4);font-size:11px;font-family:Inter,sans-serif">\${GS.user?.email||'Guest'}</p>
    </div>
    <div style="border-top:1px solid rgba(212,175,55,0.2);padding-top:12px;margin-top:4px">
      <div style="display:flex;justify-content:space-between;font-size:12px;font-family:Inter,sans-serif;color:rgba(242,230,206,0.6)">
        <span>Games Played</span><span style="color:#d4af37">\${localStorage.getItem('avalon_games')||0}</span>
      </div>
    </div>\`;
  }
}
function cycleFlag(i){
  const order=['neutral','good','evil'];const cur=GS.notepadFlags[i]||'neutral';
  GS.notepadFlags[i]=order[(order.indexOf(cur)+1)%3];renderSideNav();
}

// ═══════════════════════════════════════════════════
//  ADMIN PANEL
// ═══════════════════════════════════════════════════
function openAdmin(){document.getElementById('adminModal').style.display='block';renderAdminPanel();}
function closeAdmin(){document.getElementById('adminModal').style.display='none';}
function renderAdminPanel(){
  const c=document.getElementById('adminContent');if(!c)return;
  const cards=['merlin','percival','good_generic','good_generic_alt','assassin','morgana','mordred','oberon','evil_generic','evil_generic_alt','quest_success','quest_fail'];
  const icons=['vote_approve','vote_reject','leader_token','quest_marker_good','quest_marker_evil','vote_tracker_token','team_shield','lady_token','app_icon'];
  c.innerHTML=\`<div style="display:flex;flex-direction:column;gap:12px;font-family:Inter,sans-serif;font-size:13px">
    <p style="font-family:Cinzel,serif;color:#d4af37;font-size:11px">Authenticated as Admin</p>
    <div style="border:1px solid rgba(212,175,55,0.3);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:8px">
      <p style="color:rgba(242,230,206,0.6);font-size:11px;font-weight:bold">Game Controls</p>
      <button onclick="adminForcePhase()" class="btn-danger" style="width:100%;padding:8px;font-size:11px">⏭ Force Phase Advance</button>
      <button onclick="adminReopenVoting()" class="btn-outline" style="width:100%;padding:8px;font-size:11px">↺ Re-open Quest Voting</button>
      <button onclick="adminDropToLobby()" class="btn-outline" style="width:100%;padding:8px;font-size:11px">🏠 Drop to Lobby</button>
      <button onclick="adminTerminateRoom()" class="btn-danger" style="width:100%;padding:8px;font-size:11px">💥 Terminate Room</button>
    </div>
    <div style="border:1px solid rgba(212,175,55,0.3);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:8px">
      <p style="color:rgba(242,230,206,0.6);font-size:11px;font-weight:bold">Card Asset Uploader</p>
      <select id="adminCardTarget" style="width:100%;background:#0d1018;border:1px solid #b8941f;color:#f0d060;font-size:11px;border-radius:4px;padding:4px">
        \${cards.map(c=>\`<option value="cards/\${c}.png">\${c}</option>\`).join('')}
        \${icons.map(i=>\`<option value="icons/\${i}.png">\${i}</option>\`).join('')}
      </select>
      <input type="file" id="adminFileInput" accept="image/*" style="font-size:11px;color:rgba(242,230,206,0.5);width:100%" />
      <button onclick="adminUploadAsset()" class="btn-gold" style="width:100%;padding:8px;font-size:11px">📤 Upload & Hot-Swap</button>
    </div>
    <div style="border:1px solid rgba(212,175,55,0.3);border-radius:8px;padding:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(242,230,206,0.7);cursor:pointer">
        <input type="checkbox" \${GS.demoLake?'checked':''} style="accent-color:#d4af37" onchange="adminToggleLake(this.checked)" />
        Enable Lady of the Lake
      </label>
    </div>
  </div>\`;
}
function adminForcePhase(){showToast('Force advancing phase...','info');closeAdmin();advancePhase();}
function adminReopenVoting(){GS.questCards=[];GS.revealedCards=[];closeAdmin();renderGame();showToast('Voting re-opened.','info');}
function adminDropToLobby(){closeAdmin();resetGame();showView('viewLobby');renderLobby();}
function adminTerminateRoom(){
  closeAdmin();
  if(GS.db&&GS.roomCode){try{GS.db.ref('rooms/'+GS.roomCode).remove();}catch(e){}}
  resetGame();showView('viewLobby');renderLobby();
}
function adminToggleLake(v){GS.demoLake=v;}
async function adminUploadAsset(){
  const fi=document.getElementById('adminFileInput');const t=document.getElementById('adminCardTarget');
  if(!fi||!fi.files[0]){showToast('Select a file first.','warn');return;}
  try{
    const r=new FileReader();r.onload=async(e)=>{
      const b64=e.target.result;
      const key='asset_'+t.value;
      if(GS.db){try{await GS.db.ref('assets/'+t.value.replace('/','_').replace('.png','')).set(b64);showToast('Uploaded!','success');}catch(e){showToast('Firebase upload failed.','error');}}
      else{localStorage.setItem(key,b64);showToast('Cached locally.','info');}
    };r.readAsDataURL(fi.files[0]);
  }catch(e){showToast('Error: '+e.message,'error');}
}

// ═══════════════════════════════════════════════════
//  ASSET HELPERS
// ═══════════════════════════════════════════════════
function getAssetUrl(path){return localStorage.getItem('asset_'+path)||('./'+path);}
function getPlaceholderIcon(path){
  if(path.includes('merlin'))return'🧙';if(path.includes('percival'))return'🛡️';
  if(path.includes('assassin'))return'🗡️';if(path.includes('morgana'))return'🌑';
  if(path.includes('mordred'))return'💀';if(path.includes('oberon'))return'👁️';
  if(path.includes('good'))return'⚔️';if(path.includes('evil'))return'🔺';
  if(path.includes('quest_success'))return'✅';if(path.includes('quest_fail'))return'❌';
  if(path.includes('vote_approve'))return'✅';if(path.includes('vote_reject'))return'❌';
  if(path.includes('leader'))return'👑';if(path.includes('lady'))return'🔮';
  if(path.includes('shield'))return'🛡️';return'🎴';
}
function imgOrPlaceholder(path,alt){
  const url=getAssetUrl(path);const icon=getPlaceholderIcon(path);
  return \`<img src="\${url}" alt="\${alt}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
    <div class="card-placeholder" style="display:none"><div style="font-size:2rem">\${icon}</div><div style="font-size:10px;margin-top:4px">\${alt}</div></div>\`;
}

// ═══════════════════════════════════════════════════
//  APP INIT
// ═══════════════════════════════════════════════════
function initApp(){
  const fbOk=initFirebase();
  if(DEMO_MODE_ACTIVE){startDemoMode();return;}
  if(fbOk&&GS.auth){
    GS.auth.onAuthStateChanged(u=>{
      if(u){GS.user={uid:u.uid,name:u.displayName||u.email.split('@')[0],email:u.email,isGuest:false};GS.isAdmin=(u.email==='buenavistaaglinaodanny@gmail.com');showView('viewLobby');renderLobby();}
      else{GS.user=null;showView('viewAuth');renderAuth();}
    });
  } else {showView('viewAuth');renderAuth();}
}

// ═══════════════════════════════════════════════════
//  AUTH VIEW
// ═══════════════════════════════════════════════════
function renderAuth(){
  const v=document.getElementById('viewAuth');if(!v)return;
  v.innerHTML=\`<div style="display:flex;flex-direction:column;align-items:center;gap:24px;width:100%;max-width:320px" class="anim-fade">
    <div style="text-align:center">
      <div style="font-size:56px;margin-bottom:12px">⚔️</div>
      <h1 class="font-cinzel" style="font-size:20px;color:#d4af37;line-height:1.3">\${GAME_TEXT_CONFIG.appTitle}</h1>
      <p style="color:rgba(242,230,206,0.55);font-family:Inter,sans-serif;font-size:12px;margin-top:4px">\${GAME_TEXT_CONFIG.appSubtitle}</p>
    </div>
    <div style="width:100%;display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="color:rgba(242,230,206,0.65);font-size:12px;font-family:Inter,sans-serif;display:block;margin-bottom:6px">Your Name (Guest)</label>
        <input id="guestNameInput" class="input-gold" type="text" placeholder="Enter nickname..." maxlength="20" />
      </div>
      <button onclick="authAsGuest()" class="btn-gold" style="width:100%;padding:14px;font-size:14px">🎭 Play as Guest</button>
      <div style="display:flex;align-items:center;gap:12px">
        <div style="flex:1;height:1px;background:rgba(212,175,55,0.25)"></div>
        <span style="color:rgba(242,230,206,0.35);font-size:12px;font-family:Inter,sans-serif">or</span>
        <div style="flex:1;height:1px;background:rgba(212,175,55,0.25)"></div>
      </div>
      <button onclick="authWithGoogle()" class="btn-outline" style="width:100%;padding:12px;font-size:13px">
        <span style="display:flex;align-items:center;justify-content:center;gap:8px">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </span>
      </button>
    </div>
  </div>\`;
  const inp=document.getElementById('guestNameInput');
  if(inp)inp.addEventListener('keydown',e=>{if(e.key==='Enter')authAsGuest();});
}

function authAsGuest(){
  const inp=document.getElementById('guestNameInput');
  const name=(inp?inp.value.trim():'')||'Guest'+Math.floor(Math.random()*9000+1000);
  if(name.length<2){showToast('Enter at least 2 characters.','warn');return;}
  GS.user={uid:'guest_'+Date.now(),name,email:null,isGuest:true};GS.isAdmin=false;
  showView('viewLobby');renderLobby();
}
async function authWithGoogle(){
  if(!GS.auth){showToast('Firebase not configured.','warn');return;}
  try{const p=new firebase.auth.GoogleAuthProvider();await GS.auth.signInWithPopup(p);}
  catch(e){showToast('Sign-In failed: '+e.message,'error');}
}
function handleSignOut(){if(GS.auth)GS.auth.signOut();GS.user=null;GS.isAdmin=false;closeNav();showView('viewAuth');renderAuth();}

// ═══════════════════════════════════════════════════
//  LOBBY VIEW
// ═══════════════════════════════════════════════════
function renderLobby(tab='host'){
  const v=document.getElementById('viewLobby');if(!v)return;
  v.innerHTML=\`<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 16px 8px;flex-shrink:0">
    <button onclick="openNav()" style="background:none;border:none;color:#d4af37;font-size:20px;cursor:pointer;padding:4px">☰</button>
    <h1 class="font-cinzel" style="font-size:15px;color:#d4af37">⚔️ Avalon</h1>
    \${GS.isAdmin?\`<button onclick="openAdmin()" style="background:none;border:none;color:#d4af37;font-size:20px;cursor:pointer;padding:4px">⚙️</button>\`:'<div style="width:32px"></div>'}
  </div>
  <div style="padding:0 16px 8px;flex-shrink:0">
    <p style="color:rgba(242,230,206,0.5);font-family:Inter,sans-serif;font-size:12px">Welcome, <span style="color:#d4af37">\${GS.user?.name||'Traveller'}</span></p>
  </div>
  <div style="display:flex;border-bottom:1px solid rgba(212,175,55,0.25);flex-shrink:0">
    <button id="tabHost" onclick="renderLobby('host')" class="tab-btn \${tab==='host'?'active':''}" style="flex:1;padding:10px;background:none;border:none;color:\${tab==='host'?'#d4af37':'rgba(242,230,206,0.55)'};font-family:Cinzel,serif;font-size:12px;cursor:pointer">🏰 Host Room</button>
    <button id="tabJoin" onclick="renderLobby('join')" class="tab-btn \${tab==='join'?'active':''}" style="flex:1;padding:10px;background:none;border:none;color:\${tab==='join'?'#d4af37':'rgba(242,230,206,0.55)'};font-family:Cinzel,serif;font-size:12px;cursor:pointer">🚪 Join Room</button>
  </div>
  <div class="scroll-y" style="flex:1;padding:16px">\${tab==='host'?renderHostTab():renderJoinTab()}</div>\`;
}

function renderHostTab(){
  return \`<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;margin:0 auto" class="anim-slide">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:12px">⚙️ Room Settings</p>
    <div style="border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px;background:rgba(22,27,38,0.5)">
      <label style="display:flex;align-items:center;justify-content:space-between;font-size:13px;color:rgba(242,230,206,0.8);font-family:Inter,sans-serif;cursor:pointer">
        <span>🔮 Lady of the Lake</span><input type="checkbox" id="hostLakeCheck" style="accent-color:#d4af37;width:18px;height:18px" />
      </label>
      <label style="display:flex;align-items:center;justify-content:space-between;font-size:13px;color:rgba(242,230,206,0.8);font-family:Inter,sans-serif">
        <span>👥 Expected Players</span>
        <select id="hostPlayerCount" style="background:#0d1018;border:1px solid #b8941f;color:#f0d060;font-size:12px;border-radius:4px;padding:2px 6px">
          \${[5,6,7,8,9,10].map(n=>\`<option value="\${n}">\${n}</option>\`).join('')}
        </select>
      </label>
    </div>
    <button onclick="hostRoom()" class="btn-gold" style="width:100%;padding:14px;font-size:14px">🏰 Create Room</button>
    <p style="color:rgba(242,230,206,0.3);font-family:Inter,sans-serif;font-size:11px;text-align:center;line-height:1.6">As host, you control game flow and have access to room management.</p>
  </div>\`;
}

function renderJoinTab(){
  return \`<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;margin:0 auto" class="anim-slide">
    <div>
      <label style="color:rgba(242,230,206,0.65);font-size:12px;font-family:Inter,sans-serif;display:block;margin-bottom:6px">Enter Room Code</label>
      <input id="joinCodeInput" class="input-gold" type="text" placeholder="XXXX" maxlength="6" style="text-align:center;font-size:22px;letter-spacing:6px;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" />
    </div>
    <button onclick="joinRoom()" class="btn-gold" style="width:100%;padding:14px;font-size:14px">🚪 Join Room</button>
    <div style="border-top:1px solid rgba(212,175,55,0.2);padding-top:16px">
      <p class="font-cinzel-base" style="color:#d4af37;font-size:11px;margin-bottom:8px">🌐 Available Local Rooms</p>
      <div id="localRoomsList"><p style="color:rgba(242,230,206,0.3);font-family:Inter,sans-serif;font-size:12px">No local rooms found. Ask your host for a code.</p></div>
    </div>
  </div>\`;
}

async function hostRoom(){
  const lake=document.getElementById('hostLakeCheck')?.checked||false;
  const pc=parseInt(document.getElementById('hostPlayerCount')?.value||'6');
  const code=genCode();GS.roomCode=code;GS.isHost=true;GS.demoLake=lake;
  const me={id:GS.user.uid,name:GS.user.name,seat:0,ready:false};
  GS.players=[me];GS.myIndex=0;GS.notepadFlags=[{seat:0,flag:'neutral'}];
  if(GS.db){
    try{await GS.db.ref('rooms/'+code).set({host:GS.user.uid,lake,playerCount:pc,players:{0:me},phase:'LOBBY',created:Date.now()});listenToRoom(code);}
    catch(e){showToast('Room creation failed.','error');return;}
  }
  showView('viewRoom');renderRoom();
}

async function joinRoom(){
  const code=document.getElementById('joinCodeInput')?.value.trim().toUpperCase();
  if(!code||code.length<4){showToast('Enter a valid room code.','warn');return;}
  GS.roomCode=code;GS.isHost=false;
  if(GS.db){
    try{
      const snap=await GS.db.ref('rooms/'+code).once('value');
      if(!snap.exists()){showToast('Room not found.','error');return;}
      const data=snap.val();const existing=data.players?Object.values(data.players):[];
      const seat=existing.length;const me={id:GS.user.uid,name:GS.user.name,seat,ready:false};
      GS.myIndex=seat;await GS.db.ref('rooms/'+code+'/players/'+seat).set(me);listenToRoom(code);
    }catch(e){showToast('Join failed: '+e.message,'error');return;}
  } else {
    GS.myIndex=1;GS.players=[{id:'host',name:'Host',seat:0},{id:GS.user.uid,name:GS.user.name,seat:1}];
  }
  showView('viewRoom');renderRoom();
}

function genCode(){return Math.random().toString(36).substring(2,8).toUpperCase();}

function listenToRoom(code){
  if(!GS.db)return;
  try{
    GS.db.ref('rooms/'+code).on('value',snap=>{
      if(!snap.exists()){showToast('Room terminated.','error');resetGame();showView('viewLobby');renderLobby();return;}
      const data=snap.val();
      if(data.players)GS.players=Object.values(data.players).sort((a,b)=>a.seat-b.seat);
      if(data.phase&&data.phase!==GS.phase){
        GS.phase=data.phase;
        if(GS.phase==='NIGHT'){if(data.gameState)Object.assign(GS,data.gameState);GS.myRole=GS.roles[GS.myIndex];startNightPhase();return;}
        if(GS.phase!=='LOBBY'){if(data.gameState)Object.assign(GS,data.gameState);renderGame();}
      }
      const cur=VIEWS.find(v=>document.getElementById(v)?.style.display!=='none');
      if(cur==='viewRoom')renderRoom();
    });
    GS.db.ref('rooms/'+code+'/players/'+GS.myIndex+'/connected').set(true);
    GS.db.ref('rooms/'+code+'/players/'+GS.myIndex+'/connected').onDisconnect().set(false);
  }catch(e){console.error('[Room]',e);}
}

// ═══════════════════════════════════════════════════
//  ROOM VIEW
// ═══════════════════════════════════════════════════
function renderRoom(){
  const v=document.getElementById('viewRoom');if(!v)return;
  const pc=GS.players.length;const canStart=pc>=5&&GS.isHost;
  v.innerHTML=\`<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 16px 8px;flex-shrink:0">
    <button onclick="openNav()" style="background:none;border:none;color:#d4af37;font-size:20px;cursor:pointer;padding:4px">☰</button>
    <span class="font-cinzel" style="font-size:13px;color:#d4af37">Waiting Room</span>
    <button onclick="leaveRoom()" style="background:none;border:1px solid rgba(242,230,206,0.2);border-radius:6px;color:rgba(242,230,206,0.5);font-size:11px;padding:4px 8px;cursor:pointer;font-family:Inter,sans-serif">Leave</button>
  </div>
  <div style="text-align:center;padding:0 16px 12px;flex-shrink:0">
    <p style="color:rgba(242,230,206,0.45);font-size:11px;font-family:Inter,sans-serif;margin-bottom:4px">Room Code</p>
    <div class="room-code">\${GS.roomCode||'——'}</div>
    <p style="color:rgba(242,230,206,0.3);font-size:10px;font-family:Inter,sans-serif;margin-top:4px">Share with your party</p>
  </div>
  <div class="scroll-y" style="flex:1;padding:0 16px 16px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:11px;margin-bottom:8px">Players (\${pc}/10)</p>
    \${GS.players.map((p,i)=>\`<div style="display:flex;align-items:center;gap:12px;background:rgba(22,27,38,0.6);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:12px;margin-bottom:8px">
      <div class="avatar-ring" style="width:36px;height:36px;font-size:14px">\${p.name.charAt(0).toUpperCase()}</div>
      <div style="flex:1"><p style="font-family:Cinzel,serif;font-size:13px;color:#f2e6ce;margin:0">\${p.name}</p><p style="color:rgba(242,230,206,0.35);font-size:10px;font-family:Inter,sans-serif;margin:0">\${i===0?'Host':'Player '+(i+1)}</p></div>
      \${p.ready?'<span style="font-size:16px">✅</span>':'<span style="font-size:14px;color:rgba(242,230,206,0.25)">⏳</span>'}
    </div>\`).join('')}
    <div style="border:1px dashed rgba(212,175,55,0.2);border-radius:12px;padding:12px;text-align:center">
      <p style="color:rgba(242,230,206,0.25);font-size:11px;font-family:Inter,sans-serif">Waiting... (min 5 players)</p>
    </div>
  </div>
  <div style="flex-shrink:0;padding:12px 16px 24px">
    \${GS.isHost?\`<button onclick="startGame()" class="btn-gold" style="width:100%;padding:14px;font-size:14px;\${!canStart?'opacity:0.5;':''}" \${!canStart?'disabled':''}>
      \${canStart?'⚔️ Start Game':\`Need \${5-pc} more player(s)\`}
    </button>\`:\`<div style="text-align:center;color:rgba(242,230,206,0.4);font-family:Inter,sans-serif;font-size:13px;padding:12px">Waiting for host to start...</div>\`}
  </div>\`;
}

function leaveRoom(){
  if(GS.db&&GS.roomCode){try{GS.db.ref('rooms/'+GS.roomCode+'/players/'+GS.myIndex).remove();}catch(e){}}
  resetGame();showView('viewLobby');renderLobby();
}

// ═══════════════════════════════════════════════════
//  GAME START
// ═══════════════════════════════════════════════════
function startGame(){
  if(!GS.isHost&&!DEMO_MODE_ACTIVE)return;
  const pc=GS.players.length;if(pc<5){showToast('Need at least 5 players.','warn');return;}
  const rs=[...(GAME_TEXT_CONFIG.roleSets[pc]||GAME_TEXT_CONFIG.roleSets[5])];
  shuffleArray(rs);GS.roles=rs;GS.myRole=GS.roles[GS.myIndex];
  GS.phase='NIGHT';GS.currentLeader=Math.floor(Math.random()*pc);
  GS.currentQuest=0;GS.voteTracker=0;GS.questResults=[];GS.nominatedSeats=[];
  GS.teamVotes={};GS.questCards=[];GS.revealedCards=[];
  GS.ladyHolder=GS.demoLake?(GS.currentLeader+pc-1)%pc:null;
  GS.ladyHistory=GS.ladyHolder!==null?[GS.ladyHolder]:[];
  GS.myNightReady=false;GS.assassinTarget=null;GS.gameLog=[];
  GS.notepadFlags=GS.players.map(()=>'neutral');
  if(GS.db&&GS.roomCode){
    try{GS.db.ref('rooms/'+GS.roomCode).update({phase:'NIGHT',gameState:{roles:GS.roles,currentLeader:GS.currentLeader,currentQuest:0,voteTracker:0,questResults:[],ladyHolder:GS.ladyHolder,ladyHistory:GS.ladyHistory,demoLake:GS.demoLake}});}
    catch(e){console.error(e);}
  }
  localStorage.setItem('avalon_games',(parseInt(localStorage.getItem('avalon_games')||'0')+1).toString());
  startNightPhase();
}

// ═══════════════════════════════════════════════════
//  NIGHT PHASE
// ═══════════════════════════════════════════════════
function startNightPhase(){
  GS.phase='NIGHT';GS.myNightReady=false;
  const ov=document.getElementById('nightOverlay');if(!ov)return;
  ov.style.display='flex';ov.style.flexDirection='column';ov.style.alignItems='center';
  const demoTop=DEMO_MODE_ACTIVE?'50px':'0';
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;
  const role=GS.roles[persp];
  const ri=GAME_TEXT_CONFIG.roles[role]||{name:role,align:'good',icon:'⚔️'};
  const isEvil=ri.align==='evil';
  const cardPath='cards/'+role+'.png';
  const badges=getVisibilityBadges(persp,role);

  ov.innerHTML=\`<div style="width:100%;height:100%;display:flex;flex-direction:column;padding-top:\${demoTop}">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,#0a0c1a 0%,#000 100%);overflow:hidden">\${genStars()}</div>
    <div style="position:relative;z-index:10;display:flex;flex-direction:column;height:100%;padding:0 16px">
      <div style="text-align:center;padding:20px 0 8px;flex-shrink:0">
        <div class="font-cinzel" style="font-size:18px;color:#d4af37">🌙 Night Phase</div>
        <div style="color:rgba(242,230,206,0.55);font-family:Inter,sans-serif;font-size:12px;margin-top:4px">The realm sleeps. Identities are revealed.</div>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;min-height:0">
        <div style="position:relative;width:280px;height:280px">
          \${buildNightCircle(persp,badges)}
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
            <div class="font-cinzel" style="color:rgba(212,175,55,0.5);font-size:11px">The Round</div>
            <div class="font-cinzel" style="color:rgba(212,175,55,0.5);font-size:11px">Table</div>
          </div>
        </div>
      </div>
      <div style="flex-shrink:0;padding-bottom:20px;display:flex;flex-direction:column;align-items:center;gap:10px">
        <div style="position:relative;width:110px;height:165px">
          <div id="roleHidden" class="card-frame" style="position:absolute;inset:0;cursor:pointer;user-select:none;touch-action:none;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">
            <div style="font-size:32px">🔒</div>
            <div class="font-cinzel-base" style="font-size:10px;color:rgba(242,230,206,0.65)">Hold to Reveal</div>
          </div>
          <div id="roleRevealed" class="card-frame \${isEvil?'evil-frame':''}" style="position:absolute;inset:0;opacity:0;transition:opacity 0.4s">
            <div style="position:relative;width:100%;height:100%">\${imgOrPlaceholder(cardPath,ri.name)}</div>
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.85));padding:6px 4px;text-align:center">
              <div class="font-cinzel-base" style="font-size:10px;color:\${isEvil?'#f87171':'#93c5fd'}">\${ri.icon} \${ri.name}</div>
            </div>
          </div>
        </div>
        <div id="visionText" style="display:none;text-align:center;max-width:300px">
          <p style="color:rgba(242,230,206,0.75);font-family:Inter,sans-serif;font-size:12px;line-height:1.5">\${GAME_TEXT_CONFIG.roleVision[role]||''}</p>
        </div>
        <button id="nightReadyBtn" onclick="setNightReady()" class="btn-gold" style="width:100%;max-width:300px;padding:12px;font-size:13px">\${GAME_TEXT_CONFIG.ui.readyBtn}</button>
        <div id="nightWaitMsg" style="display:none;color:rgba(242,230,206,0.35);font-family:Inter,sans-serif;font-size:12px">Waiting for all players...</div>
      </div>
    </div>
  </div>\`;
  setupHoldReveal();
}

function genStars(){
  let s='';for(let i=0;i<80;i++){const x=Math.random()*100,y=Math.random()*60,sz=Math.random()*2+0.5,o=Math.random()*0.7+0.2;s+=\`<div style="position:absolute;left:\${x}%;top:\${y}%;width:\${sz}px;height:\${sz}px;border-radius:50%;background:#fff;opacity:\${o}"></div>\`;}return s;
}

function buildNightCircle(persp,badges){
  const count=GS.players.length;const rad=110;const cx=140,cy=140;let h='';
  GS.players.forEach((p,i)=>{
    const ang=(2*Math.PI*i/count)-Math.PI/2;
    const x=cx+rad*Math.cos(ang)-22;const y=cy+rad*Math.sin(ang)-22;
    const badge=badges[i];const isMe=i===persp;
    let rc='avatar-ring';
    if(badge==='evil')rc+=' merlin-seen';
    else if(badge==='percival')rc+=' percival-seen';
    else if(badge==='evil-peer')rc+=' evil-peer';
    const bl=badge?getBadgeLabel(badge):'';
    h+=\`<div style="position:absolute;left:\${x}px;top:\${y}px">
      <div class="\${rc}" style="width:44px;height:44px;font-size:11px;position:relative">
        <span style="font-weight:\${isMe?'bold':'normal'};color:\${isMe?'#d4af37':'#f2e6ce'}">\${p.name.charAt(0)}</span>
        \${badge?\`<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:8px;white-space:nowrap;background:rgba(0,0,0,0.85);border-radius:4px;padding:1px 4px;color:\${badge==='percival'?'#60a5fa':'#f87171'}">\${bl}</div>\`:''}
        <div style="position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:8px;color:rgba(242,230,206,\${isMe?'0.9':'0.45'});font-family:Inter,sans-serif">\${isMe?'(You)':p.name.substring(0,5)}</div>
      </div>
    </div>\`;
  });return h;
}

function getVisibilityBadges(persp,role){
  const b={};const roles=GS.roles;const count=GS.players.length;
  if(role==='merlin'){for(let i=0;i<count;i++){if(i===persp)continue;const r=roles[i];if(['morgana','assassin','oberon','evil_generic'].includes(r))b[i]='evil';}}
  else if(role==='percival'){for(let i=0;i<count;i++){if(i===persp)continue;if(['merlin','morgana'].includes(roles[i]))b[i]='percival';}}
  else if(['assassin','morgana','mordred','evil_generic'].includes(role)){for(let i=0;i<count;i++){if(i===persp)continue;const r=roles[i];if(['assassin','morgana','mordred','evil_generic'].includes(r))b[i]='evil-peer';}}
  return b;
}
function getBadgeLabel(b){if(b==='evil')return'⚠️ Evil';if(b==='percival')return'❓ Merlin?';if(b==='evil-peer')return'🔴 Ally';return'';}

function setupHoldReveal(){
  const hidden=document.getElementById('roleHidden');const revealed=document.getElementById('roleRevealed');const vt=document.getElementById('visionText');
  if(!hidden||!revealed)return;
  const show=()=>{hidden.style.opacity='0';revealed.style.opacity='1';if(vt)vt.style.display='block';};
  const hide=()=>{hidden.style.opacity='1';revealed.style.opacity='0';if(vt)vt.style.display='none';};
  hidden.addEventListener('mousedown',show);hidden.addEventListener('touchstart',e=>{e.preventDefault();show();},{passive:false});
  hidden.addEventListener('mouseup',hide);hidden.addEventListener('mouseleave',hide);hidden.addEventListener('touchend',hide);hidden.addEventListener('touchcancel',hide);
}

function setNightReady(){
  GS.myNightReady=true;
  const btn=document.getElementById('nightReadyBtn');const msg=document.getElementById('nightWaitMsg');
  if(btn){btn.textContent='✅ Ready!';btn.style.opacity='0.5';}if(msg)msg.style.display='block';
  if(GS.db&&GS.roomCode){try{GS.db.ref('rooms/'+GS.roomCode+'/players/'+GS.myIndex+'/ready').set(true);}catch(e){}}
  if(DEMO_MODE_ACTIVE||!GS.db)setTimeout(advanceToNomination,1000);
}
function advanceToNomination(){
  const ov=document.getElementById('nightOverlay');if(ov)ov.style.display='none';
  GS.phase='NOMINATION';showView('viewGame');renderGame();
}

// ═══════════════════════════════════════════════════
//  MAIN GAME VIEW
// ═══════════════════════════════════════════════════
function renderGame(){
  const v=document.getElementById('viewGame');if(!v)return;
  const dTop=DEMO_MODE_ACTIVE?'padding-top:50px':'';
  v.setAttribute('style','display:flex;flex-direction:column;height:100%;position:relative;'+dTop);
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;
  v.innerHTML=\`<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 12px 6px;flex-shrink:0">
    <button onclick="openNav()" style="background:none;border:none;color:#d4af37;font-size:18px;cursor:pointer;padding:4px">☰</button>
    <div style="text-align:center">
      <div class="font-cinzel" style="font-size:12px;color:#d4af37">\${GAME_TEXT_CONFIG.phases[GS.phase]||GS.phase}</div>
      <div style="color:rgba(242,230,206,0.45);font-family:Inter,sans-serif;font-size:10px">Q\${GS.currentQuest+1} · Leader: \${GS.players[GS.currentLeader]?.name||'?'}</div>
    </div>
    \${GS.isAdmin?\`<button onclick="openAdmin()" style="background:none;border:none;color:#d4af37;font-size:18px;cursor:pointer;padding:4px">⚙️</button>\`:'<div style="width:28px"></div>'}
  </div>
  <div style="flex-shrink:0;padding:0 12px 4px">\${renderQuestBoard()}</div>
  <div style="flex-shrink:0;padding:0 12px 4px">\${renderVoteTracker()}</div>
  <div style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;min-height:0">
    <div id="gameCircle" style="position:relative;width:310px;height:310px;flex-shrink:0">\${buildGameCircle()}</div>
  </div>
  <div class="scroll-y" style="flex-shrink:0;padding:8px 12px 20px;max-height:260px">
    <div id="phasePanel" class="anim-slide">\${renderPhasePanel()}</div>
  </div>\`;
}

function renderQuestBoard(){
  const count=GS.players.length;const sizes=GAME_TEXT_CONFIG.questSizes[count]||GAME_TEXT_CONFIG.questSizes[5];
  const twoFail=GAME_TEXT_CONFIG.twoFailRequired[count];
  let h='<div style="display:flex;gap:6px;justify-content:center">';
  for(let i=0;i<5;i++){
    const r=GS.questResults[i];let cls='quest-slot';let ico='';
    if(r==='success'){cls+=' success';ico='✅';}else if(r==='fail'){cls+=' fail';ico='❌';}else if(i===GS.currentQuest)cls+=' active';
    h+=\`<div class="\${cls}" style="width:52px;height:58px;font-size:9px">
      <div style="font-size:\${r?'18px':'12px'}">\${ico||sizes[i]}</div>
      <div style="font-size:8px;color:rgba(212,175,55,0.65)">Q\${i+1}</div>
      \${twoFail===i&&!r?'<div style="font-size:7px;color:#fca5a5">2✗</div>':''}
    </div>\`;
  }return h+'</div>';
}

function renderVoteTracker(){
  let h='<div style="display:flex;align-items:center;gap:4px;justify-content:center"><span style="color:rgba(242,230,206,0.4);font-family:Inter,sans-serif;font-size:9px;margin-right:2px">REJECTIONS:</span>';
  for(let i=0;i<5;i++){let cls='vote-tracker-dot';if(i<GS.voteTracker)cls+=' active';if(i===4)cls+=' hammer';h+=\`<div class="\${cls}"><span style="font-size:8px">\${i===4?'🔨':''}</span></div>\`;}
  return h+'</div>';
}

function buildGameCircle(){
  const count=GS.players.length;const rad=118;const cx=155,cy=155;
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;let h='';
  GS.players.forEach((p,i)=>{
    const ang=(2*Math.PI*i/count)-Math.PI/2;const x=cx+rad*Math.cos(ang)-22;const y=cy+rad*Math.sin(ang)-22;
    const isMe=i===persp;const isLeader=i===GS.currentLeader;const isNom=GS.nominatedSeats.includes(i);
    const hasLady=GS.ladyHolder===i&&GS.demoLake;const voteDone=GS.teamVotes[i]!==undefined;
    const isAssTarget=GS.assassinTarget===i;
    let rc='avatar-ring';
    if(isNom)rc+=' selected-ring';else if(GS.nominatedSeats.length>0&&!isNom&&GS.phase==='NOMINATION')rc+=' dimmed';
    const clickable=GS.phase==='NOMINATION'&&GS.currentLeader===persp||GS.phase==='ASSASSIN'&&(GS.roles[persp]==='assassin'||(DEMO_MODE_ACTIVE&&i!==persp))||GS.phase==='LADY'&&GS.ladyHolder===persp;
    const clickFn=GS.phase==='NOMINATION'&&GS.currentLeader===persp?\`toggleNominate(\${i})\`:GS.phase==='ASSASSIN'&&GS.roles[persp]==='assassin'?\`setAssTarget(\${i})\`:GS.phase==='LADY'&&GS.ladyHolder===persp?\`setLadyTgt(\${i})\`:'';
    h+=\`<div style="position:absolute;left:\${x}px;top:\${y}px" onclick="\${clickFn}">
      <div class="\${rc}" style="width:44px;height:44px;font-size:11px;position:relative;cursor:\${clickable?'pointer':'default'}">
        <span style="font-weight:\${isMe?'bold':'normal'};color:\${isMe?'#d4af37':'#f2e6ce'}">\${p.name.charAt(0)}</span>
        \${isLeader?'<div style="position:absolute;top:-11px;left:50%;transform:translateX(-50%);font-size:13px">👑</div>':''}
        \${hasLady?'<div style="position:absolute;bottom:-11px;left:50%;transform:translateX(-50%);font-size:12px">🔮</div>':''}
        \${voteDone&&GS.phase==='TEAM_VOTE'?\`<div style="position:absolute;top:-9px;right:-9px;font-size:10px;background:rgba(0,0,0,0.85);border-radius:3px;padding:1px 2px">\${GS.teamVotes[i]==='approve'?'✅':'❌'}</div>\`:''}
        \${isAssTarget?'<div style="position:absolute;inset:-3px;border-radius:50%;border:2.5px solid #f87171;box-shadow:0 0 16px rgba(248,113,113,0.7)"></div>':''}
        <div style="position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:8px;color:rgba(242,230,206,\${isMe?0.9:0.45});font-family:Inter,sans-serif">\${isMe?'(You)':p.name.substring(0,6)}</div>
      </div>
    </div>\`;
  });
  h+=\`<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none">
    <div style="color:rgba(212,175,55,0.5);font-family:Cinzel,serif;font-size:10px">✅\${GS.questResults.filter(r=>r==='success').length} ❌\${GS.questResults.filter(r=>r==='fail').length}</div>
  </div>\`;
  return h;
}

function toggleNominate(seat){
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;
  if(GS.phase!=='NOMINATION'||GS.currentLeader!==persp)return;
  const count=GS.players.length;const qs=(GAME_TEXT_CONFIG.questSizes[count]||GAME_TEXT_CONFIG.questSizes[5])[GS.currentQuest];
  const idx=GS.nominatedSeats.indexOf(seat);
  if(idx>-1)GS.nominatedSeats.splice(idx,1);
  else{if(GS.nominatedSeats.length>=qs){showToast('Max '+qs+' players.','warn');return;}GS.nominatedSeats.push(seat);}
  renderGame();
}

function renderPhasePanel(){
  switch(GS.phase){
    case'NOMINATION':return renderNomPanel();case'TEAM_VOTE':return renderVotePanel();
    case'QUEST_VOTE':return renderQuestVotePanel();case'REVEAL':return renderRevealPanel();
    case'LADY':return renderLadyPanel();case'ASSASSIN':return renderAssassinPanel();
    default:return\`<p style="color:rgba(242,230,206,0.4);font-size:12px;text-align:center;font-family:Inter,sans-serif">Phase: \${GS.phase}</p>\`;
  }
}

function renderNomPanel(){
  const count=GS.players.length;const qs=(GAME_TEXT_CONFIG.questSizes[count]||GAME_TEXT_CONFIG.questSizes[5])[GS.currentQuest];
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;const isLeader=GS.currentLeader===persp;
  return\`<div style="display:flex;flex-direction:column;gap:8px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:12px;text-align:center">\${isLeader?\`Select \${qs} players for Quest \${GS.currentQuest+1}\`:\`Waiting for \${GS.players[GS.currentLeader]?.name} to nominate...\`}</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
      \${GS.players.map((p,i)=>{const sel=GS.nominatedSeats.includes(i);return\`<button onclick="toggleNominate(\${i})" class="nominate-btn \${sel?'selected':''}" style="\${!isLeader?'opacity:0.45;pointer-events:none;':''}\${sel?'border-color:#d4af37;background:rgba(212,175,55,0.2);':''}">\${sel?'✅ ':''}\${p.name}</button>\`;}).join('')}
    </div>
    \${isLeader&&GS.nominatedSeats.length===qs?\`<button onclick="submitNomination()" class="btn-gold" style="width:100%;padding:12px;font-size:13px">⚔️ Propose Team</button>\`:''}
  </div>\`;
}

function submitNomination(){
  const count=GS.players.length;const qs=(GAME_TEXT_CONFIG.questSizes[count]||GAME_TEXT_CONFIG.questSizes[5])[GS.currentQuest];
  if(GS.nominatedSeats.length!==qs){showToast('Select exactly '+qs+' players.','warn');return;}
  GS.phase='TEAM_VOTE';GS.teamVotes={};GS.myVote=null;renderGame();
}

function renderVotePanel(){
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;const mv=GS.teamVotes[persp];
  const allVoted=Object.keys(GS.teamVotes).length===GS.players.length;
  const teamNames=GS.nominatedSeats.map(s=>GS.players[s]?.name).join(', ');
  return\`<div style="display:flex;flex-direction:column;gap:8px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:11px;text-align:center">Proposed Team: <span style="color:#f2e6ce">\${teamNames}</span></p>
    \${mv?\`<div style="text-align:center"><span style="font-family:Cinzel,serif;font-size:13px;color:\${mv==='approve'?'#4ade80':'#f87171'}">\${mv==='approve'?'✅ You Approved':'❌ You Rejected'}</span><p style="color:rgba(242,230,206,0.35);font-size:11px;font-family:Inter,sans-serif;margin-top:4px">Waiting... (\${Object.keys(GS.teamVotes).length}/\${GS.players.length})</p></div>\`:
    \`<div style="display:flex;gap:8px">
      <button onclick="castVote('approve')" class="btn-good" style="flex:1;padding:12px;font-size:13px">\${GAME_TEXT_CONFIG.ui.voteApprove}</button>
      <button onclick="castVote('reject')" class="btn-danger" style="flex:1;padding:12px;font-size:13px">\${GAME_TEXT_CONFIG.ui.voteReject}</button>
    </div>\`}
    \${allVoted&&(GS.isHost||DEMO_MODE_ACTIVE)?\`<button onclick="resolveVote()" class="btn-gold" style="width:100%;padding:8px;font-size:12px">Reveal Votes →</button>\`:''}
  </div>\`;
}

function castVote(vote){
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;
  GS.teamVotes[persp]=vote;renderGame();
  if(Object.keys(GS.teamVotes).length===GS.players.length)setTimeout(resolveVote,600);
}

function resolveVote(){
  const votes=Object.values(GS.teamVotes);const approvals=votes.filter(v=>v==='approve').length;
  const maj=Math.ceil(GS.players.length/2);
  if(approvals>=maj){GS.phase='QUEST_VOTE';GS.questCards=[];GS.myQuestCard=null;showToast('Team approved! ('+approvals+'✅ vs '+(votes.length-approvals)+'❌)','success');renderGame();}
  else{
    GS.voteTracker++;showToast('Team rejected! ('+approvals+'✅ vs '+(votes.length-approvals)+'❌)','warn');
    if(GS.voteTracker>=5){showToast('5 rejections! Evil wins!','error');endGame('evil');return;}
    GS.currentLeader=(GS.currentLeader+1)%GS.players.length;GS.phase='NOMINATION';GS.nominatedSeats=[];GS.teamVotes={};renderGame();
  }
}

function renderQuestVotePanel(){
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;const role=GS.roles[persp];
  const onQuest=GS.nominatedSeats.includes(persp);const myCard=GS.myQuestCard;
  const allSub=GS.questCards.length===GS.nominatedSeats.length;
  if(!onQuest)return\`<div style="text-align:center;display:flex;flex-direction:column;gap:6px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:12px">Quest in Progress</p>
    <p style="color:rgba(242,230,206,0.5);font-family:Inter,sans-serif;font-size:11px">Team: \${GS.nominatedSeats.map(s=>GS.players[s]?.name).join(', ')}</p>
    <p style="color:rgba(242,230,206,0.3);font-size:11px;font-family:Inter,sans-serif">Cards submitted: \${GS.questCards.length}/\${GS.nominatedSeats.length}</p>
  </div>\`;
  const isGoodRole=['merlin','percival','good_generic'].includes(role);
  return\`<div style="display:flex;flex-direction:column;gap:8px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:12px;text-align:center">Choose your Quest Card</p>
    \${myCard?\`<div style="text-align:center"><span style="font-family:Cinzel,serif;color:\${myCard==='success'?'#4ade80':'#f87171'};font-size:13px">\${myCard==='success'?'✅ Success submitted':'❌ Fail submitted'}</span><p style="color:rgba(242,230,206,0.3);font-size:11px;font-family:Inter,sans-serif;margin-top:4px">\${GS.questCards.length}/\${GS.nominatedSeats.length} submitted</p></div>\`:
    \`<div style="display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;gap:8px">
        <button onclick="submitQCard('success')" class="btn-good" style="flex:1;padding:12px;font-size:13px">✅ SUCCESS</button>
        <button onclick="submitQCard('fail')" class="btn-danger" style="flex:1;padding:12px;font-size:13px">❌ FAIL</button>
      </div>
      <div id="goodWarn" style="display:none" class="warn-pulse"><p style="font-family:Inter,sans-serif;font-size:11px;text-align:center;color:#fde68a">\${GAME_TEXT_CONFIG.ui.goodWarnMsg}</p></div>
    </div>\`}
    \${allSub&&(GS.isHost||DEMO_MODE_ACTIVE)?\`<button onclick="revealQuestResult()" class="btn-gold" style="width:100%;padding:8px;font-size:12px">Reveal Quest →</button>\`:''}
  </div>\`;
}

function submitQCard(card){
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;const role=GS.roles[persp];
  if(card==='fail'&&['merlin','percival','good_generic'].includes(role)){const w=document.getElementById('goodWarn');if(w)w.style.display='block';}
  GS.myQuestCard=card;GS.questCards.push(card);shuffleArray(GS.questCards);renderGame();
  if(GS.questCards.length===GS.nominatedSeats.length)setTimeout(()=>{GS.phase='REVEAL';GS.revealedCards=[];renderGame();},500);
}

function revealQuestResult(){GS.phase='REVEAL';GS.revealedCards=[];renderGame();}

function renderRevealPanel(){
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;const isLeader=GS.currentLeader===persp;
  const total=GS.questCards.length;const revd=GS.revealedCards.length;const allRev=revd>=total;
  const succ=GS.questCards.filter(c=>c==='success').length;const fails=GS.questCards.filter(c=>c==='fail').length;
  return\`<div style="display:flex;flex-direction:column;gap:10px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:12px;text-align:center">Quest Result Reveal</p>
    <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap">
      \${GS.questCards.map((card,i)=>{const isRev=i<revd;const isTap=isLeader&&i===revd;return\`<div onclick="\${isTap?'revealNextCard()':''}" style="width:50px;height:72px;border-radius:8px;border:1.5px solid \${isRev?(card==='success'?'#22c55e':'#c00'):'#d4af37'};background:\${isRev?(card==='success'?'rgba(20,60,20,0.8)':'rgba(60,10,10,0.8)'):'rgba(20,24,35,0.8)'};display:flex;align-items:center;justify-content:center;cursor:\${isTap?'pointer':'default'};position:relative">
        \${isRev?\`<span style="font-size:20px">\${card==='success'?'✅':'❌'}</span>\`:isTap?\`<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:16px">🎴</span><span style="font-size:7px;color:#d4af37;font-family:Cinzel,serif">Tap</span></div>\`:\`<span style="font-size:16px">🎴</span>\`}
      </div>\`;}).join('')}
    </div>
    \${allRev?\`<div style="text-align:center;border:1px solid rgba(212,175,55,0.3);border-radius:10px;padding:12px;background:rgba(22,27,38,0.6)">
      <p class="font-cinzel-base" style="font-size:13px">✅ \${succ} SUCCESS &nbsp;|&nbsp; ❌ \${fails} FAIL</p>
      <p style="color:rgba(242,230,206,0.5);font-family:Inter,sans-serif;font-size:11px;margin-top:4px">\${getQResultText(fails)}</p>
    </div>
    \${GS.isHost||DEMO_MODE_ACTIVE?\`<button onclick="finalizeQ(\${fails})" class="btn-gold" style="width:100%;padding:12px;font-size:13px">Continue →</button>\`:''}
    \`:\`<p style="text-align:center;color:rgba(242,230,206,0.4);font-size:11px;font-family:Inter,sans-serif">\${isLeader?'Tap each card to reveal →':'Waiting for leader...'}</p>\`}
  </div>\`;
}

function getQResultText(fails){
  const count=GS.players.length;const tf=GAME_TEXT_CONFIG.twoFailRequired[count];const need2=tf===GS.currentQuest;
  if(need2)return fails>=2?'❌ Quest FAILED (2 fails required)':fails===1?'⚠️ 1 fail only — Quest SUCCEEDS!':'✅ Quest SUCCEEDED!';
  return fails>=1?'❌ Quest FAILED!':'✅ Quest SUCCEEDED!';
}
function revealNextCard(){if(GS.revealedCards.length<GS.questCards.length){GS.revealedCards.push(GS.questCards[GS.revealedCards.length]);renderGame();}}

function finalizeQ(fails){
  const count=GS.players.length;const tf=GAME_TEXT_CONFIG.twoFailRequired[count];const need2=tf===GS.currentQuest;
  const failed=need2?fails>=2:fails>=1;
  GS.questResults[GS.currentQuest]=failed?'fail':'success';GS.voteTracker=0;
  GS.gameLog.push('Quest '+(GS.currentQuest+1)+': '+(failed?'FAIL':'SUCCESS'));
  const succs=GS.questResults.filter(r=>r==='success').length;const fails2=GS.questResults.filter(r=>r==='fail').length;
  if(succs>=3){GS.phase='ASSASSIN';renderGame();return;}
  if(fails2>=3){endGame('evil');return;}
  if(GS.demoLake&&GS.currentQuest>=1&&GS.currentQuest<=3){GS.phase='LADY';renderGame();return;}
  advanceQuest();
}
function advanceQuest(){GS.currentQuest++;GS.currentLeader=(GS.currentLeader+1)%GS.players.length;GS.phase='NOMINATION';GS.nominatedSeats=[];GS.teamVotes={};renderGame();}

function renderLadyPanel(){
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;const hasLady=GS.ladyHolder===persp;
  const holderName=GS.players[GS.ladyHolder]?.name||'?';
  const eligible=GS.players.map((_,i)=>i).filter(i=>!GS.ladyHistory.includes(i)&&i!==GS.ladyHolder);
  return\`<div style="display:flex;flex-direction:column;gap:8px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:12px;text-align:center">🔮 Lady of the Lake</p>
    <p style="color:rgba(242,230,206,0.55);font-family:Inter,sans-serif;font-size:11px;text-align:center">\${hasLady?GAME_TEXT_CONFIG.ui.ladyPrompt:holderName+' holds the Lady token.'}</p>
    \${hasLady?\`<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
      \${eligible.map(i=>\`<button onclick="setLadyTgt(\${i})" class="nominate-btn \${GS.assassinTarget===i?'selected':''}" style="\${GS.assassinTarget===i?'border-color:#d4af37;background:rgba(212,175,55,0.2);':''}">🔍 \${GS.players[i]?.name}</button>\`).join('')}
    </div>
    \${GS.assassinTarget!==null&&eligible.includes(GS.assassinTarget)?\`<button onclick="confirmLady()" class="btn-gold" style="width:100%;padding:12px;font-size:13px">🔮 Investigate \${GS.players[GS.assassinTarget]?.name}</button>\`:''}
    \`:\`<p style="text-align:center;color:rgba(242,230,206,0.3);font-family:Inter,sans-serif;font-size:11px">Waiting for \${holderName}...</p>\`}
  </div>\`;
}

function setLadyTgt(seat){GS.assassinTarget=seat;renderGame();}
function confirmLady(){
  const ts=GS.assassinTarget;if(ts===null)return;
  const tr=GS.roles[ts];const ti=GAME_TEXT_CONFIG.roles[tr];const al=ti?.align==='good'?'🔵 GOOD':'🔴 EVIL';
  showToast(GS.players[ts]?.name+' is '+al+'!',ti?.align==='good'?'success':'error',4000);
  GS.ladyHistory.push(ts);GS.ladyHolder=ts;GS.assassinTarget=null;
  GS.gameLog.push('Lady: '+GS.players[ts]?.name+' is '+al);
  setTimeout(advanceQuest,2000);
}

function renderAssassinPanel(){
  const persp=DEMO_MODE_ACTIVE?GS.demoPerspective:GS.myIndex;const role=GS.roles[persp];const isAss=role==='assassin';
  return\`<div style="display:flex;flex-direction:column;gap:8px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:12px;text-align:center">🗡️ Assassination Phase</p>
    <p style="color:rgba(242,230,206,0.55);font-family:Inter,sans-serif;font-size:11px;text-align:center">\${isAss?GAME_TEXT_CONFIG.ui.assassinPrompt:'The Assassin is choosing...'}</p>
    \${isAss?\`<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
      \${GS.players.map((p,i)=>{if(GS.roles[i]==='assassin')return'';return\`<button onclick="setAssTarget(\${i})" class="nominate-btn \${GS.assassinTarget===i?'selected':''}" style="\${GS.assassinTarget===i?'border-color:#f87171;background:rgba(200,0,0,0.2);':''}">🗡️ \${p.name}</button>\`;}).join('')}
    </div>
    \${GS.assassinTarget!==null?\`<button onclick="confirmAss()" class="btn-danger" style="width:100%;padding:12px;font-size:13px">🗡️ Assassinate \${GS.players[GS.assassinTarget]?.name}</button>\`:''}
    \`:\`<p style="text-align:center;color:rgba(242,230,206,0.3);font-size:11px;font-family:Inter,sans-serif">Observing...</p>\`}
  </div>\`;
}
function setAssTarget(seat){GS.assassinTarget=seat;renderGame();}
function confirmAss(){
  if(GS.assassinTarget===null)return;const tr=GS.roles[GS.assassinTarget];const tn=GS.players[GS.assassinTarget]?.name;
  if(tr==='merlin'){showToast('🗡️ '+tn+' was Merlin! Evil wins!','error',5000);endGame('evil_assassin');}
  else{showToast(tn+' was NOT Merlin! Good wins!','success',5000);endGame('good');}
}
// aliases for circle onclick
function setAssTarget(seat){GS.assassinTarget=seat;renderGame();}
function setLadyTgt(seat){GS.assassinTarget=seat;renderGame();}

function advancePhase(){
  const order=['NOMINATION','TEAM_VOTE','QUEST_VOTE','REVEAL','LADY','ASSASSIN'];
  const idx=order.indexOf(GS.phase);if(idx<order.length-1){GS.phase=order[idx+1];renderGame();}
}

// ═══════════════════════════════════════════════════
//  END GAME
// ═══════════════════════════════════════════════════
function endGame(winner){GS.phase='END';showView('viewEnd');renderEndScreen(winner);}
function renderEndScreen(winner){
  const v=document.getElementById('viewEnd');if(!v)return;
  const gw=winner==='good';const killed=winner==='evil_assassin';
  const titles={good:'⚔️ Good Triumphs!',evil:'💀 Evil Prevails!',evil_assassin:'🗡️ Merlin is Slain!'};
  const subs={good:'The Knights have completed their sacred quests.',evil:'The forces of darkness have corrupted Camelot.',evil_assassin:"The Assassin's blade found Merlin. Evil seizes victory!"};
  const roles=GS.players.map((p,i)=>{const r=GS.roles[i]||'good_generic';const ri=GAME_TEXT_CONFIG.roles[r]||{};return\`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(212,175,55,0.15)">
    <div style="width:32px;height:44px;border-radius:6px;border:1px solid \${ri.align==='evil'?'#c00':'#d4af37'};background:#1a1e2a;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">\${ri.icon||'🎴'}</div>
    <div><p style="font-family:Cinzel,serif;font-size:13px;color:\${ri.align==='evil'?'#f87171':'#93c5fd'};margin:0">\${p.name}</p><p style="color:rgba(242,230,206,0.4);font-size:11px;font-family:Inter,sans-serif;margin:0">\${ri.name||r}</p></div>
  </div>\`;}).join('');
  v.innerHTML=\`<div style="flex-shrink:0;padding:32px 24px 16px;text-align:center">
    <div style="font-size:56px;margin-bottom:12px">\${gw?'🏆':killed?'🗡️':'💀'}</div>
    <h1 class="font-cinzel" style="font-size:20px;color:\${gw?'#d4af37':'#f87171'};line-height:1.3">\${titles[winner]}</h1>
    <p style="color:rgba(242,230,206,0.55);font-family:Inter,sans-serif;font-size:12px;margin-top:8px;line-height:1.6">\${subs[winner]}</p>
    <div style="display:flex;justify-content:center;gap:6px;margin-top:16px">
      \${GS.questResults.map(r=>\`<div style="width:38px;height:38px;border-radius:8px;border:1px solid \${r==='success'?'#22c55e':'#c00'};background:\${r==='success'?'rgba(20,60,20,0.6)':'rgba(60,10,10,0.6)'};display:flex;align-items:center;justify-content:center;font-size:16px">\${r==='success'?'✅':'❌'}</div>\`).join('')}
    </div>
  </div>
  <div class="scroll-y" style="flex:1;padding:0 16px 8px">
    <p class="font-cinzel-base" style="color:#d4af37;font-size:11px;margin-bottom:8px">Role Reveal</p>
    \${roles}
  </div>
  <div style="flex-shrink:0;padding:12px 16px 32px">
    <button onclick="resetAndLobby()" class="btn-gold" style="width:100%;padding:14px;font-size:14px">🏰 Return to Lobby</button>
  </div>\`;
}
function resetAndLobby(){resetGame();showView('viewLobby');renderLobby();}
function resetGame(){
  Object.assign(GS,{phase:'SETUP',roomCode:null,isHost:false,players:[],myIndex:0,myRole:null,roles:[],currentQuest:0,currentLeader:0,voteTracker:0,questResults:[],nominatedSeats:[],teamVotes:{},questCards:[],revealedCards:[],ladyHolder:null,ladyHistory:[],assassinTarget:null,myNightReady:false,myVote:null,myQuestCard:null,notepadFlags:[],gameLog:[]});
}

// ═══════════════════════════════════════════════════
//  DEMO MODE ENGINE
// ═══════════════════════════════════════════════════
function startDemoMode(){
  const strip=document.getElementById('demoStrip');if(strip)strip.style.display='block';
  GS.demoPlayers=6;GS.demoLake=false;GS.demoPerspective=0;
  initDemoGame();setupDemoControls();
}
function initDemoGame(){
  const n=GS.demoPlayers;const names=['You','Aria','Bran','Caius','Dana','Elric','Fiona','Gareth','Hilde','Ivan'];
  GS.players=Array.from({length:n},(_,i)=>({id:'p'+i,name:names[i]||'Bot'+i,seat:i}));
  GS.myIndex=0;GS.isHost=true;GS.user={uid:'demo',name:'You',email:null,isGuest:true};
  const rs=[...(GAME_TEXT_CONFIG.roleSets[n]||GAME_TEXT_CONFIG.roleSets[5])];shuffleArray(rs);GS.roles=rs;GS.myRole=GS.roles[0];
  GS.phase='NIGHT';GS.currentLeader=0;GS.currentQuest=0;GS.voteTracker=0;GS.questResults=[];
  GS.nominatedSeats=[];GS.teamVotes={};GS.questCards=[];GS.revealedCards=[];
  GS.ladyHolder=GS.demoLake?n-1:null;GS.ladyHistory=GS.ladyHolder!==null?[GS.ladyHolder]:[];
  GS.assassinTarget=null;GS.myNightReady=false;GS.notepadFlags=GS.players.map(()=>'neutral');GS.gameLog=[];
  updateDemoDropdown();startNightPhase();
}
function setupDemoControls(){
  const sl=document.getElementById('demoPlayerSlider');const lbl=document.getElementById('demoPlayerCount');
  const lk=document.getElementById('demoLakeCheck');const dp=document.getElementById('demoPerspective');
  const bb=document.getElementById('demoBotBtn');const rb=document.getElementById('demoRestartBtn');
  if(sl){sl.addEventListener('input',()=>{GS.demoPlayers=parseInt(sl.value);if(lbl)lbl.textContent=GS.demoPlayers;});sl.addEventListener('change',()=>initDemoGame());}
  if(lk)lk.addEventListener('change',()=>{GS.demoLake=lk.checked;});
  if(dp)dp.addEventListener('change',()=>{GS.demoPerspective=parseInt(dp.value);if(GS.phase==='NIGHT')startNightPhase();else renderGame();});
  if(bb)bb.addEventListener('click',doBotAction);
  if(rb)rb.addEventListener('click',initDemoGame);
}
function updateDemoDropdown(){
  const dp=document.getElementById('demoPerspective');if(!dp)return;
  dp.innerHTML=GS.players.map((p,i)=>\`<option value="\${i}">\${i===0?'You':p.name} (\${GAME_TEXT_CONFIG.roles[GS.roles[i]]?.name||GS.roles[i]})</option>\`).join('');
  dp.value=GS.demoPerspective;
}
function doBotAction(){
  try{
    switch(GS.phase){
      case'NIGHT':GS.myNightReady=true;advanceToNomination();break;
      case'NOMINATION':botNominate();break;
      case'TEAM_VOTE':botVoteAll();break;
      case'QUEST_VOTE':botQCards();break;
      case'REVEAL':while(GS.revealedCards.length<GS.questCards.length)GS.revealedCards.push(GS.questCards[GS.revealedCards.length]);renderGame();setTimeout(()=>{finalizeQ(GS.questCards.filter(c=>c==='fail').length);},600);break;
      case'LADY':botLady();break;
      case'ASSASSIN':botAssassin();break;
    }
  }catch(e){showToast('Bot error: '+e.message,'error');console.error('[Bot]',e);}
}
function botNominate(){
  const ls=GS.currentLeader;const lr=GS.roles[ls];const count=GS.players.length;
  const qs=(GAME_TEXT_CONFIG.questSizes[count]||GAME_TEXT_CONFIG.questSizes[5])[GS.currentQuest];
  const isEvil=['assassin','morgana','mordred','oberon','evil_generic'].includes(lr);
  let team=[ls];
  if(isEvil){
    const allies=GS.players.map((_,i)=>i).filter(i=>i!==ls&&['assassin','morgana','mordred','evil_generic'].includes(GS.roles[i]));
    const mordSeat=GS.players.findIndex((_,i)=>GS.roles[i]==='mordred'&&i!==ls);
    if(mordSeat>-1&&team.length<qs)team.push(mordSeat);
    shuffleArray(allies);for(const a of allies){if(!team.includes(a)&&team.length<qs)team.push(a);}
    const good=GS.players.map((_,i)=>i).filter(i=>!team.includes(i)&&!['assassin','morgana','mordred','oberon','evil_generic'].includes(GS.roles[i]));
    shuffleArray(good);for(const g of good){if(team.length>=qs)break;team.push(g);}
  } else {
    const safe=GS.players.map((_,i)=>i).filter(i=>i!==ls);shuffleArray(safe);
    for(const s of safe){if(team.length>=qs)break;team.push(s);}
  }
  GS.nominatedSeats=team.slice(0,qs);GS.demoPerspective=ls;updateDemoDropdown();submitNomination();
}
function botVoteAll(){
  GS.players.forEach((_,i)=>{
    if(GS.teamVotes[i]!==undefined)return;const role=GS.roles[i];
    const isEvil=['assassin','morgana','mordred','oberon','evil_generic'].includes(role);
    const hasAlly=GS.nominatedSeats.some(s=>['assassin','morgana','mordred','evil_generic'].includes(GS.roles[s])&&s!==i);
    let vote;
    if(isEvil){vote=hasAlly?'approve':(Math.random()<0.3?'approve':'reject');}
    else{const onTeam=GS.nominatedSeats.includes(i);const hammer=GS.voteTracker>=4;vote=(onTeam||hammer)?'approve':'reject';}
    GS.teamVotes[i]=vote;
  });setTimeout(resolveVote,400);renderGame();
}
function botQCards(){
  const evilOnTeam=GS.nominatedSeats.filter(s=>['assassin','morgana','mordred','oberon','evil_generic'].includes(GS.roles[s]));
  GS.questCards=[];
  GS.nominatedSeats.forEach((seat)=>{
    const role=GS.roles[seat];const isEvil=['assassin','morgana','mordred','oberon','evil_generic'].includes(role);
    let card;
    if(isEvil){const sorted=evilOnTeam.slice().sort((a,b)=>a-b);card=seat===sorted[sorted.length-1]?'fail':'success';}
    else card='success';
    GS.questCards.push(card);
  });
  shuffleArray(GS.questCards);GS.myQuestCard=GS.questCards[0];GS.phase='REVEAL';GS.revealedCards=[];renderGame();
}
function botLady(){
  const elig=GS.players.map((_,i)=>i).filter(i=>!GS.ladyHistory.includes(i)&&i!==GS.ladyHolder);
  if(!elig.length){advanceQuest();return;}
  GS.assassinTarget=elig[Math.floor(Math.random()*elig.length)];renderGame();setTimeout(confirmLady,800);
}
function botAssassin(){
  const cands=GS.players.map((_,i)=>i).filter(i=>!['assassin','morgana','mordred','oberon','evil_generic'].includes(GS.roles[i]));
  let best=-1,bestSeat=cands[0];
  cands.forEach(s=>{const sc=Math.random();if(sc>best){best=sc;bestSeat=s;}});
  GS.assassinTarget=bestSeat;renderGame();setTimeout(confirmAss,1200);
}

// ═══════════════════════════════════════════════════
//  UTILITY
// ═══════════════════════════════════════════════════
function shuffleArray(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
<\/script>
</body>
</html>
`;

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Register service worker for the main Vite app
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: '#11141a' }}>
      <iframe
        ref={iframeRef}
        srcDoc={GAME_HTML}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        allow="camera;microphone"
        title="The Resistance: Avalon"
      />
    </div>
  );
}
