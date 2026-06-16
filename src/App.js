import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9oK68bv0idKQRUKx0d5444-4zO1Wa_FQ",
  authDomain: "emerson---ctc---quiz-portal.firebaseapp.com",
  projectId: "emerson---ctc---quiz-portal",
  storageBucket: "emerson---ctc---quiz-portal.firebasestorage.app",
  messagingSenderId: "626001984532",
  appId: "1:626001984532:web:cf258fda677359426abb01",
  measurementId: "G-61B0C7M8HJ",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ADMIN_IDS = ["E1550484", "E281851"];

const TEAM_MEMBERS = [
  { id: "E281851", name: "Vasanthakumar N" },
  { id: "E1550481", name: "Mugilan P" },
  { id: "E1550478", name: "Cibi U" },
  { id: "E1550484", name: "Moulish Kumar R" },
  { id: "E1557513", name: "Rahul R" },
  { id: "E1552208", name: "Elamparithi K" },
  { id: "E1422291", name: "Goutham Ram R" },
  { id: "E1557751", name: "SriRagaventhiran S" },
  { id: "E1553691", name: "Sarathkumar T" },
  { id: "E1550955", name: "Velraj S" },
  { id: "E1551617", name: "Prasath PM" },
  { id: "E1470957", name: "Heyram G" },
  { id: "E1552207", name: "Hemandh N" },
  { id: "E1550485", name: "Sridhar D" },
  { id: "E1550475", name: "Kumara Kannan M" },
  { id: "E1551612", name: "Kesavan" },
  { id: "E1552209", name: "Vignesh" },
];

const validatePassword = (pw) => {
  const e = [];
  if (pw.length < 6) e.push("At least 6 characters");
  if (!/[A-Z]/.test(pw)) e.push("At least 1 uppercase letter");
  if (!/[^a-zA-Z0-9]/.test(pw)) e.push("At least 1 symbol (e.g. @, #, !)");
  return e;
};

const hashPassword = async (pw) => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pw)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Fisher-Yates shuffle
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800&family=Sora:wght@300;400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  
  :root {
    --navy: #0d1226;
    --navy2: #151b33;
    --navy3: #1d2442;
    --panel: rgba(26, 33, 59, 0.75);
    --panel-solid: #1d2442;
    --border: rgba(255, 255, 255, 0.09);
    --border-hover: rgba(0, 212, 184, 0.35);
    
    --teal: #00d4b8;
    --teal2: #00b89e;
    --teal-dim: rgba(0, 212, 184, 0.12);
    --teal-glow: rgba(0, 212, 184, 0.25);
    --border-teal: rgba(0, 212, 184, 0.3);
    
    --amber: #f59e0b;
    --amber2: #d97706;
    --amber-dim: rgba(245, 158, 11, 0.12);
    --amber-glow: rgba(245, 158, 11, 0.25);
    
    --red: #ef4444;
    --red2: #dc2626;
    --red-dim: rgba(239, 68, 68, 0.12);
    --red-glow: rgba(239, 68, 68, 0.25);
    
    --green: #22c55e;
    --green2: #16a34a;
    --green-dim: rgba(34, 197, 94, 0.12);
    --green-glow: rgba(34, 197, 94, 0.25);
    
    --purple: #a78bfa;
    --purple2: #8b5cf6;
    --purple-dim: rgba(167, 139, 250, 0.12);
    --purple-glow: rgba(167, 139, 250, 0.25);
    
    --text: #edf2f7;
    --text-dim: #b8c8d8;
    --text-faint: #8096b0;
    --header-bg: rgba(13, 18, 38, 0.85);
    --header-bg-idle: rgba(6, 9, 19, 0.65);
    --header-border-idle: rgba(255, 255, 255, 0.09);
    --header-border-scroll: rgba(0, 212, 184, 0.35);
    --card-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    --input-bg: rgba(26, 34, 53, 0.6);
    
    --font-sans: 'Outfit', 'Sora', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  body.light-mode {
    --navy: #f8fafc;
    --navy2: #f1f5f9;
    --navy3: #ffffff;
    --panel: rgba(255, 255, 255, 0.75);
    --panel-solid: #ffffff;
    --border: rgba(15, 23, 42, 0.08);
    --border-hover: rgba(13, 148, 136, 0.25);
    
    --teal: #0d9488;
    --teal2: #0f766e;
    --teal-dim: rgba(13, 148, 136, 0.06);
    --teal-glow: rgba(13, 148, 136, 0.12);
    --border-teal: rgba(13, 148, 136, 0.25);
    
    --amber: #b45309;
    --amber2: #92400e;
    --amber-dim: rgba(180, 83, 9, 0.06);
    --amber-glow: rgba(180, 83, 9, 0.1);
    
    --red: #be123c;
    --red2: #9f1239;
    --red-dim: rgba(190, 18, 60, 0.06);
    --red-glow: rgba(190, 18, 60, 0.10);
    
    --green: #047857;
    --green2: #065f46;
    --green-dim: rgba(4, 120, 87, 0.06);
    --green-glow: rgba(4, 120, 87, 0.1);
    
    --purple: #6d28d9;
    --purple2: #5b21b6;
    --purple-dim: rgba(109, 40, 217, 0.06);
    --purple-glow: rgba(109, 40, 217, 0.1);
    
    --text: #0f172a;
    --text-dim: #334155;
    --text-faint: #64748b;
    --header-bg: rgba(248, 250, 252, 0.85);
    --header-bg-idle: rgba(226, 232, 240, 0.65);
    --header-border-idle: rgba(15, 23, 42, 0.08);
    --header-border-scroll: rgba(13, 148, 136, 0.25);
    --card-shadow: 0 15px 30px -10px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0,0,0,0.03);
    --input-bg: rgba(255, 255, 255, 0.95);
  }

  body {
    background: radial-gradient(circle at top center, var(--teal-dim) 0%, var(--navy) 75%), var(--navy);
    color: var(--text);
    font-family: var(--font-sans);
    min-height: 100vh;
    transition: background 0.3s ease, color 0.3s ease;
    overflow-x: hidden;
    position: relative;
  }

  /* Cybernetic background decorations in dark mode */
  body:not(.light-mode)::before {
    content: '';
    position: fixed;
    top: 0;
    left: 10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(0, 242, 254, 0.03) 0%, rgba(139, 92, 246, 0.005) 50%, transparent 100%);
    filter: blur(100px);
    z-index: -1;
    pointer-events: none;
  }
  body:not(.light-mode)::after {
    content: '';
    position: fixed;
    bottom: -10%;
    right: 10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, rgba(0, 242, 254, 0.005) 50%, transparent 100%);
    filter: blur(100px);
    z-index: -1;
    pointer-events: none;
  }

  input,select,textarea,button{font-family:var(--font-sans);}
  ::-webkit-scrollbar{width:6px;height:6px;}
  ::-webkit-scrollbar-track{background:var(--navy);}
  ::-webkit-scrollbar-thumb{background:var(--teal-glow);border-radius:3px;}
  ::-webkit-scrollbar-thumb:hover{background:var(--border-teal);}

  /* Micro-animations */
  .pulse{animation:pulse 2s ease-in-out infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  
  .fadeIn{animation:fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(16px);filter:blur(6px);}to{opacity:1;transform:translateY(0);filter:blur(0);}}
  
  .slideIn{animation:slideIn 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px);filter:blur(4px);}to{opacity:1;transform:translateX(0);filter:blur(0);}}

  /* Premium Card Styles */
  .glass-panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .glass-panel-hover:hover {
    transform: translateY(-4px);
    border-color: var(--border-teal);
    box-shadow: 0 16px 40px -10px rgba(0, 242, 254, 0.1), var(--card-shadow);
  }

  /* Dashboard Grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
  }

  /* Interactive cards on Dashboard */
  .menu-card {
    position: relative;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px 24px;
    cursor: pointer;
    overflow: hidden;
    backdrop-filter: blur(20px);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .menu-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: transparent;
    transition: background 0.3s ease;
  }
  .menu-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--card-shadow);
  }
  .menu-card.menu-teal:hover {
    border-color: rgba(0, 242, 254, 0.35);
    box-shadow: 0 16px 40px -15px rgba(0, 242, 254, 0.25), var(--card-shadow);
  }
  .menu-card.menu-teal::before { background: var(--teal); }
  
  .menu-card.menu-amber:hover {
    border-color: rgba(251, 191, 36, 0.35);
    box-shadow: 0 16px 40px -15px rgba(251, 191, 36, 0.25), var(--card-shadow);
  }
  .menu-card.menu-amber::before { background: var(--amber); }

  .menu-card.menu-green:hover {
    border-color: rgba(16, 185, 129, 0.35);
    box-shadow: 0 16px 40px -15px rgba(16, 185, 129, 0.25), var(--card-shadow);
  }
  .menu-card.menu-green::before { background: var(--green); }

  .menu-card.menu-purple:hover {
    border-color: rgba(167, 139, 250, 0.35);
    box-shadow: 0 16px 40px -15px rgba(167, 139, 250, 0.25), var(--card-shadow);
  }
  .menu-card.menu-purple::before { background: var(--purple); }

  .menu-card.menu-red:hover {
    border-color: rgba(244, 63, 94, 0.35);
    box-shadow: 0 16px 40px -15px rgba(244, 63, 94, 0.25), var(--card-shadow);
  }
  .menu-card.menu-red::before { background: var(--red); }

  /* Premium Buttons */
  .btn-primary {
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, var(--teal) 0%, var(--teal2) 100%);
    color: var(--navy);
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.05em;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 20px -8px var(--teal-glow);
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px -6px var(--teal-glow);
    filter: brightness(1.05);
  }
  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }
  .btn-primary:disabled {
    background: var(--navy3);
    color: var(--text-faint);
    border: 1px solid var(--border);
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-ghost {
    background: none;
    border: 1px solid var(--border-teal);
    color: var(--teal);
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: all 0.2s ease;
  }
  .btn-ghost:hover {
    background: var(--teal-dim);
    border-color: var(--teal);
    transform: translateY(-1px);
  }

  .btn-back {
    background: none;
    border: none;
    color: var(--text-faint);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.05em;
    padding: 6px 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    transition: color 0.2s, transform 0.2s;
  }
  .btn-back:hover {
    color: var(--teal);
    transform: translateX(-3px);
  }

  /* Form Fields */
  .field {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 14px;
    margin-bottom: 14px;
    outline: none;
    transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    backdrop-filter: blur(4px);
  }
  .field:focus {
    border-color: var(--teal);
    box-shadow: 0 0 0 3px var(--teal-dim);
    background: var(--navy3);
  }
  .field::placeholder { color: var(--text-faint); }
  .field.error { border-color: var(--red); }

  /* Option Buttons in Tests */
  .option-btn {
    width: 100%;
    padding: 16px 20px;
    margin-bottom: 10px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--navy3);
    color: var(--text);
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    font-family: var(--font-sans);
    transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    display: flex;
    align-items: center;
  }
  .option-btn:hover {
    border-color: var(--border-teal);
    background: var(--teal-dim);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -10px var(--teal-glow);
  }
  .option-btn:active { transform: translateY(0); }
  .option-btn.selected {
    border-color: var(--teal);
    background: var(--teal-dim);
    color: var(--teal);
    font-weight: 600;
    box-shadow: 0 8px 24px -8px var(--teal-glow);
  }

  /* Password field wrappers */
  .pw-wrap { position: relative; margin-bottom: 14px; }
  .pw-wrap .field { margin-bottom: 0; padding-right: 48px; }
  .pw-eye {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-faint);
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s, color 0.2s;
  }
  .pw-eye:hover { opacity: 1; color: var(--teal); }

  /* Modals */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3, 5, 12, 0.85);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(8px);
    animation: fadeIn 0.25s ease;
  }
  .modal-box {
    background: var(--panel-solid);
    border: 1px solid var(--border-teal);
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 640px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 30px 70px -10px rgba(0, 242, 254, 0.15), var(--card-shadow);
  }

  /* File uploads */
  input[type="file"] { display: none; }
  .file-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px 20px;
    background: var(--input-bg);
    border: 1px dashed var(--border-teal);
    color: var(--teal);
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 14px;
    transition: all 0.2s ease;
  }
  .file-upload-btn:hover {
    background: var(--teal-dim);
    border-color: var(--teal);
  }

  /* Top Navigation */
  .top-nav-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border: none;
    background: none;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    flex: 1;
    border-top: 3px solid transparent;
  }
  .top-nav-btn.active {
    border-top-color: var(--teal);
    background: var(--teal-dim);
  }
  .top-nav-btn:not([disabled]):hover {
    background: var(--teal-dim);
  }
  .top-nav-btn:not([disabled]):hover .nav-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .nav-tooltip {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(-6px);
    background: var(--navy2);
    border: 1px solid var(--border-teal);
    color: var(--teal);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: var(--font-mono);
    padding: 5px 12px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s, transform 0.25s;
    z-index: 300;
    box-shadow: var(--card-shadow);
  }

  /* Nav pending badge */
  .nav-badge {
    position: absolute;
    top: 4px;
    right: 8px;
    background: var(--red);
    color: #fff;
    border-radius: 20px;
    min-width: 18px;
    height: 18px;
    font-size: 10px;
    font-family: var(--font-mono);
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    box-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
  }

  /* Security Watermark & Warning */
  .no-select { -webkit-user-select:none; -moz-user-select:none; user-select:none; }
  .watermark {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 150;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.025;
    transform: rotate(-30deg);
    font-size: clamp(20px, 5vw, 36px);
    font-weight: 900;
    color: var(--text);
    font-family: var(--font-mono);
    letter-spacing: 0.1em;
    white-space: nowrap;
    text-align: center;
    line-height: 2;
    text-transform: uppercase;
  }
  body.light-mode .watermark { opacity: 0.015; }
  
  .strike-overlay {
    position: fixed;
    inset: 0;
    z-index: 500;
    background: rgba(3, 5, 12, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    backdrop-filter: blur(10px);
    animation: fadeIn 0.3s ease;
  }
  .strike-box {
    background: var(--navy2);
    border: 1px solid var(--red);
    border-radius: 24px;
    padding: 40px 32px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 50px rgba(244, 63, 94, 0.15), var(--card-shadow);
  }

  /* Navigation elements in tests */
  .q-nav-btn {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--border-teal);
    background: var(--navy3);
    color: var(--teal);
  }
  .q-nav-btn:hover:not(:disabled) {
    background: var(--teal-dim);
    border-color: var(--teal);
  }
  .q-nav-btn.submit-btn {
    background: linear-gradient(135deg, var(--red) 0%, var(--red2) 100%);
    color: #fff;
    border: none;
    box-shadow: 0 8px 20px -8px rgba(244, 63, 94, 0.4);
  }
  .q-nav-btn.submit-btn:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 12px 24px -6px rgba(244, 63, 94, 0.4);
  }
  .q-nav-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Dot Selector for Questions */
  .q-dot {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    font-size: 11px;
    font-family: var(--font-mono);
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    border: 1px solid var(--border);
  }
  .q-dot:hover {
    transform: translateY(-2px);
  }
  .q-dot.answered {
    background: var(--teal);
    color: var(--navy);
    border-color: var(--teal);
    box-shadow: 0 4px 10px -3px var(--teal-glow);
  }
  .q-dot.current {
    border-color: var(--teal);
    color: var(--teal);
    background: var(--teal-dim);
    box-shadow: 0 0 10px var(--teal-glow);
  }
  .q-dot.unanswered {
    background: var(--navy3);
    color: var(--text-faint);
  }

  /* Answer review widgets */
  .ans-card-correct {
    background: var(--green-dim);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 14px;
  }
  .ans-card-wrong {
    background: var(--red-dim);
    border: 1px solid rgba(244, 63, 94, 0.2);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 14px;
  }

  .sched-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-family: var(--font-mono);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    background: var(--amber-dim);
    color: var(--amber);
    border: 1px solid rgba(251, 191, 36, 0.25);
  }

  .home-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    background: var(--red);
    color: #fff;
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 700;
    font-family: var(--font-mono);
    box-shadow: 0 0 8px rgba(244, 63, 94, 0.4);
  }

  /* Draft Items */
  .draft-item {
    background: var(--navy2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 10px;
    transition: border-color 0.2s;
  }
  .draft-item:hover {
    border-color: var(--border-teal);
  }
  
  /* 3D Podium Layout */
  .podium-container {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 16px;
    margin-bottom: 32px;
    margin-top: 16px;
  }
  
  .podium-step {
    flex: 1;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 24px 12px 16px 12px;
    text-align: center;
    position: relative;
    box-shadow: var(--card-shadow);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    backdrop-filter: blur(20px);
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .podium-step.rank-1 {
    flex: 1.1;
    height: 180px;
    border: 2px solid var(--teal);
    box-shadow: 0 12px 40px -10px var(--teal-glow), var(--card-shadow);
  }
  
  .podium-step.rank-2 {
    height: 145px;
    border: 1px solid var(--purple);
    box-shadow: 0 8px 30px -10px var(--purple-glow), var(--card-shadow);
  }
  
  .podium-step.rank-3 {
    height: 125px;
    border: 1px solid var(--amber);
    box-shadow: 0 8px 30px -10px var(--amber-glow), var(--card-shadow);
  }
  
  .podium-badge {
    position: absolute;
    top: -20px;
    font-size: 24px;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    animation: float 3s ease-in-out infinite;
  }
  .podium-step.rank-1 .podium-badge { animation-delay: 0s; }
  .podium-step.rank-2 .podium-badge { animation-delay: 0.5s; }
  .podium-step.rank-3 .podium-badge { animation-delay: 1s; }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  
  @media (max-width: 520px) {
    .podium-container {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .podium-step {
      height: auto !important;
      padding: 16px 20px;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      text-align: left;
    }
    .podium-badge {
      position: static;
      margin-right: 14px;
      font-size: 20px;
      animation: none;
      top: auto;
    }
    .podium-step.rank-1 {
      border-width: 1px;
    }
  }
`;;

/* ─── Avatar ─── */
function Avatar({ name, size = 36 }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = ["#00d4b8", "#f59e0b", "#a78bfa", "#60a5fa", "#f472b6"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}22`,
        border: `2px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color,
        flexShrink: 0,
        fontFamily: "'DM Mono',monospace",
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}

/* ─── StatChip ─── */
function StatChip({ label, value, accent }) {
  return (
    <div
      style={{
        background: "var(--navy3)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 14px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: accent || "var(--teal)",
          fontFamily: "'DM Mono',monospace",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-faint)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ─── Password field with visible eye icon ─── */
function PwField({ value, onChange, placeholder, onKeyDown, hasError }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        className={`field${hasError ? " error" : ""}`}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <button
        className="pw-eye"
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
      >
        {show ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ─── Image Compressor ─── */
const compressImage = (dataUrl, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = (err) => reject(err);
  });
};

/* ─── Image Uploader ─── */
function ImageUploader({ value, onChange }) {
  const ref = useRef();
  const [isCompressing, setIsCompressing] = useState(false);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const compressed = await compressImage(ev.target.result);
        onChange(compressed);
      } catch (err) {
        console.error("Image compression failed, fallback to original", err);
        onChange(ev.target.result);
      } finally {
        setIsCompressing(false);
      }
    };
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <input type="file" accept="image/*" ref={ref} onChange={handleFile} />
      <label
        className="file-upload-btn"
        onClick={() => !isCompressing && ref.current.click()}
        style={{
          opacity: isCompressing ? 0.7 : 1,
          cursor: isCompressing ? "not-allowed" : "pointer",
        }}
      >
        <span>{isCompressing ? "⏳" : "📎"}</span>
        {isCompressing
          ? "Compressing image..."
          : value
          ? "Image selected — click to change"
          : "Attach image from device (optional)"}
      </label>
      {value && (
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: 4,
          }}
        >
          <img
            src={value}
            alt="preview"
            style={{
              maxWidth: "100%",
              maxHeight: 140,
              borderRadius: 10,
              border: "1px solid var(--border-teal)",
              display: "block",
            }}
          />
          <button
            onClick={() => onChange(null)}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "rgba(239,68,68,0.8)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: 22,
              height: 22,
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Draft Modal ─── */
function DraftModal({ questions, onClose, onDelete, onEdit }) {
  const [editIdx, setEditIdx] = useState(null);
  const [editData, setEditData] = useState(null);
  const startEdit = (i) => {
    setEditIdx(i);
    setEditData({
      ...questions[i],
      options: questions[i].options ? [...questions[i].options] : [],
    });
  };
  const saveEdit = () => {
    onEdit(editIdx, editData);
    setEditIdx(null);
    setEditData(null);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--teal)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              Draft Preview
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>
              {questions.length} Question{questions.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text-faint)",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        {questions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "var(--text-faint)",
              fontSize: 13,
            }}
          >
            No questions added yet.
          </div>
        )}
        {questions.map((q, i) => (
          <div key={i} className="draft-item">
            {editIdx === i ? (
              <div className="slideIn">
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--teal)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: "'DM Mono',monospace",
                    marginBottom: 10,
                  }}
                >
                  Editing Q{String(i + 1).padStart(2, "0")}
                </div>
                <textarea
                  className="field"
                  value={editData.text}
                  rows={3}
                  onChange={(e) =>
                    setEditData({ ...editData, text: e.target.value })
                  }
                  style={{ resize: "vertical" }}
                  placeholder="Question text..."
                />
                {editData.options && editData.options.length > 0 ? (
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-faint)",
                        marginBottom: 8,
                      }}
                    >
                      Options — radio marks correct answer
                    </div>
                    {editData.options.map((opt, oi) => (
                      <div
                        key={oi}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <input
                          type="radio"
                          checked={editData.correct === opt}
                          onChange={() =>
                            setEditData({ ...editData, correct: opt })
                          }
                          style={{ accentColor: "var(--teal)", flexShrink: 0 }}
                        />
                        <input
                          className="field"
                          style={{ flex: 1, marginBottom: 0 }}
                          value={opt}
                          onChange={(e) => {
                            const o = [...editData.options];
                            const wc = editData.correct === opt;
                            o[oi] = e.target.value;
                            setEditData({
                              ...editData,
                              options: o,
                              correct: wc ? e.target.value : editData.correct,
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    className="field"
                    placeholder="Correct answer"
                    value={editData.correct || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, correct: e.target.value })
                    }
                  />
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    className="btn-primary"
                    style={{ padding: "10px 16px", width: "auto" }}
                    onClick={saveEdit}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditIdx(null);
                      setEditData(null);
                    }}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      color: "var(--text-dim)",
                      padding: "10px 16px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      width: "auto",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-faint)",
                      fontFamily: "'DM Mono',monospace",
                      marginBottom: 5,
                    }}
                  >
                    Q{String(i + 1).padStart(2, "0")} ·{" "}
                    <span style={{ color: "var(--teal)" }}>{q.type}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                      lineHeight: 1.5,
                      marginBottom: q.options ? 8 : 0,
                    }}
                  >
                    {q.text}
                  </div>
                  {q.image && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--teal)",
                        marginTop: 4,
                      }}
                    >
                      📎 Image attached
                    </div>
                  )}
                  {q.options && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginTop: 6,
                      }}
                    >
                      {q.options.map((opt, oi) => (
                        <span
                          key={oi}
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background:
                              opt === q.correct
                                ? "rgba(34,197,94,0.15)"
                                : "var(--navy3)",
                            color:
                              opt === q.correct
                                ? "var(--green)"
                                : "var(--text-dim)",
                            border:
                              opt === q.correct
                                ? "1px solid rgba(34,197,94,0.3)"
                                : "1px solid var(--border)",
                            fontWeight: opt === q.correct ? 700 : 400,
                          }}
                        >
                          {opt === q.correct ? "✓ " : ""}
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                  {!q.options && q.correct && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--green)",
                        marginTop: 4,
                      }}
                    >
                      ✓ {q.correct}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(i)}
                    style={{
                      background: "var(--navy3)",
                      border: "1px solid var(--border)",
                      color: "var(--text-dim)",
                      padding: "5px 10px",
                      borderRadius: 7,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(i)}
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "var(--red)",
                      padding: "5px 10px",
                      borderRadius: 7,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Result Review Modal ─── */
function ResultReviewModal({ result, quiz, onClose }) {
  if (!quiz)
    return (
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-box">
          <p
            style={{
              color: "var(--text-faint)",
              textAlign: "center",
              padding: "32px 0",
            }}
          >
            Quiz data unavailable.
          </p>
          <button
            className="btn-primary"
            style={{ width: "auto", display: "block", margin: "0 auto", padding: "10px 24px" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );

  const correct = result.score || 0;
  const wrong = (result.total || 0) - correct;
  const pct = result.total ? Math.round((correct / result.total) * 100) : 0;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--teal)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              Answer Review
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>
              {quiz.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text-faint)",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Score summary */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {[
            {
              label: "Correct",
              val: correct,
              color: "var(--green)",
              bg: "rgba(34,197,94,0.1)",
              border: "rgba(34,197,94,0.3)",
            },
            {
              label: "Wrong",
              val: wrong,
              color: "var(--red)",
              bg: "rgba(239,68,68,0.1)",
              border: "rgba(239,68,68,0.3)",
            },
            {
              label: "Score",
              val: pct + "%",
              color: "var(--teal)",
              bg: "var(--navy3)",
              border: "var(--border)",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 10,
                padding: "12px 8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginTop: 2,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Per-question breakdown */}
        {quiz.questions.map((q, i) => {
          const userAns = (result.responses?.[i] || "").trim();
          const isCorrect =
            userAns.toLowerCase() === (q.correct || "").trim().toLowerCase();
          return (
            <div
              key={i}
              className={isCorrect ? "ans-card-correct" : "ans-card-wrong"}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "'DM Mono',monospace",
                  color: "var(--text-faint)",
                  marginBottom: 6,
                }}
              >
                Q{String(i + 1).padStart(2, "0")} ·{" "}
                {isCorrect ? (
                  <span style={{ color: "var(--green)" }}>✓ CORRECT</span>
                ) : (
                  <span style={{ color: "var(--red)" }}>✗ INCORRECT</span>
                )}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {q.text}
              </div>

              {/* MCQ: show all options colour-coded */}
              {q.options ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {q.options.map((opt, oi) => {
                    const isCorrectOpt =
                      opt.trim().toLowerCase() ===
                      (q.correct || "").trim().toLowerCase();
                    const isUserChoice =
                      userAns.trim().toLowerCase() === opt.trim().toLowerCase();
                    let bg = "var(--navy3)",
                      border = "1px solid var(--border)",
                      color = "var(--text-dim)";
                    if (isCorrectOpt) {
                      bg = "rgba(34,197,94,0.12)";
                      border = "1px solid rgba(34,197,94,0.4)";
                      color = "var(--green)";
                    }
                    if (isUserChoice && !isCorrectOpt) {
                      bg = "rgba(239,68,68,0.12)";
                      border = "1px solid rgba(239,68,68,0.4)";
                      color = "var(--red)";
                    }
                    return (
                      <div
                        key={oi}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 12px",
                          borderRadius: 8,
                          background: bg,
                          border,
                          color,
                          fontWeight: isCorrectOpt || isUserChoice ? 600 : 400,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: 10,
                            opacity: 0.6,
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isCorrectOpt && <span>✓</span>}
                        {isUserChoice && !isCorrectOpt && (
                          <span style={{ fontSize: 11 }}>← Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fill-blank */
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <div
                    style={{
                      padding: "9px 12px",
                      borderRadius: 8,
                      background: isCorrect
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(239,68,68,0.12)",
                      border: `1px solid ${
                        isCorrect
                          ? "rgba(34,197,94,0.4)"
                          : "rgba(239,68,68,0.4)"
                      }`,
                      color: isCorrect ? "var(--green)" : "var(--red)",
                      fontSize: 13,
                    }}
                  >
                    Your answer: {userAns || "(not answered)"}
                  </div>
                  {!isCorrect && (
                    <div
                      style={{
                        padding: "9px 12px",
                        borderRadius: 8,
                        background: "rgba(34,197,94,0.12)",
                        border: "1px solid rgba(34,197,94,0.4)",
                        color: "var(--green)",
                        fontSize: 13,
                      }}
                    >
                      ✓ Correct: {q.correct}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  // ── Theme State ──
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("npd_portal_dark_mode");
    return saved !== "false";
  });

  useEffect(() => {
    if (!darkMode) {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // ── Auth ──
  const [loginStep, setLoginStep] = useState("id");
  const [authCode, setAuthCode] = useState("");
  const [foundMember, setFoundMember] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwErrors, setPwErrors] = useState([]);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);

  // ── App state ──
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [archiveQuiz, setArchiveQuiz] = useState(null);
  const [reviewResult, setReviewResult] = useState(null); // for answer review modal
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [archiveSearch, setArchiveSearch] = useState("");

  // ── Quiz session ──
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQIdx, setCurrentQIdx] = useState(0);

  // FIX: refs to prevent double-submit / double flag
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Quiz security ──
  const [strikes, setStrikes] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const MAX_STRIKES = 3;

  // ── Post quiz ──
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [qType, setQType] = useState("MCQ");
  const [qText, setQText] = useState("");
  const [qImage, setQImage] = useState(null);
  const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [ansKey, setAnsKey] = useState("");
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showMetaPanel, setShowMetaPanel] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [exemptUsers, setExemptUsers] = useState([]); // users exempt from quiz

  // ── Scheduled publish ──
  const [postType, setPostType] = useState("now"); // "now" | "later"
  const [scheduledAt, setScheduledAt] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // ── Scroll Listener for Header dynamic styling ──
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Session restore ──
  useEffect(() => {
    const checkSession = async () => {
      const saved = localStorage.getItem("npd_portal_id");
      if (saved) {
        try {
          const ud = await getDoc(doc(db, "users", saved));
          if (ud.exists()) {
            setUser({ id: saved, ...ud.data() });
            setView("home");
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // ── Data fetch ──
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const qS = await getDocs(
        query(collection(db, "quizzes"), orderBy("createdAt", "desc"))
      );
      const rS = await getDocs(
        query(collection(db, "results"), orderBy("submittedAt", "desc"))
      );
      setQuizzes(qS.docs.map((d) => ({ id: d.id, ...d.data() })));
      setResults(rS.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, [user, view, activeQuiz]);

  // ── Quiz security listeners ──
  useEffect(() => {
    if (!activeQuiz) return;
    const onVisibility = () => {
      if (document.hidden) triggerStrike("Tab switch detected");
    };
    const onBlur = () => {
      triggerStrike("Window left");
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) triggerStrike("Fullscreen exited");
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
    // eslint-disable-next-line
  }, [activeQuiz]);

  // FIX: block strike events if already submitting (alert() triggers blur)
  const triggerStrike = (reason) => {
    if (submittingRef.current) return;
    setStrikes((prev) => {
      const next = prev + 1;
      setWarningReason(reason);
      if (next >= MAX_STRIKES) {
        setShowWarning(false);
        doAutoSubmit();
      } else {
        setShowWarning(true);
      }
      return next;
    });
  };

  // FIX: single-write guard via submittingRef
  const doAutoSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    // Capture quiz before clearing state
    setActiveQuiz((q) => {
      if (q) {
        addDoc(collection(db, "results"), {
          userId: user.id,
          userName: user.name,
          quizId: q.id,
          quizTitle: q.title,
          score: 0,
          total: q.questions.length,
          responses: {},
          submittedAt: new Date(),
          flagged: true,
          flagReason: "Auto-submitted: 3 integrity violations",
        });
      }
      return null;
    });

    exitFullscreen();
    setUserAnswers({});
    setStrikes(0);
    setCurrentQIdx(0);
    setIsSubmitting(false);
    setView("home");
    setTimeout(
      () =>
        alert(
          "⚠️ Quiz auto-submitted due to 3 integrity violations. Your attempt has been flagged."
        ),
      150
    );
  };

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  };

  const startQuiz = (q) => {
    submittingRef.current = false;
    setStrikes(0);
    setShowWarning(false);
    setCurrentQIdx(0);
    setUserAnswers({});
    setActiveQuiz(q);
    enterFullscreen();
  };

  // FIX: single-write guard on normal submit
  const submitTest = async () => {
    if (submittingRef.current || isSubmitting) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    let score = 0;
    activeQuiz.questions.forEach((q, i) => {
      if (
        (userAnswers[i] || "").trim().toLowerCase() ===
        (q.correct || "").trim().toLowerCase()
      )
        score++;
    });

    await addDoc(collection(db, "results"), {
      userId: user.id,
      userName: user.name,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      score,
      total: activeQuiz.questions.length,
      responses: userAnswers,
      submittedAt: new Date(),
      flagged: false,
    });

    const msg = `✅ Final Marks: ${score} / ${activeQuiz.questions.length}`;
    exitFullscreen();
    setActiveQuiz(null);
    setUserAnswers({});
    setStrikes(0);
    setCurrentQIdx(0);
    setIsSubmitting(false);
    setView("home");
    setTimeout(() => alert(msg), 150);
  };

  // ── Auth handlers ──
  const handleIdSubmit = async () => {
    setAuthError("");
    const id = authCode.toUpperCase().trim();
    const member = TEAM_MEMBERS.find((m) => m.id === id);
    if (!member) {
      setAuthError("Username not found. Check your ID and try again.");
      return;
    }
    setAuthLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", id));
      setFoundMember(member);
      setLoginStep(snap.exists() ? "password" : "create");
    } catch {
      setAuthError("Connection error. Try again.");
    }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const data = (await getDoc(doc(db, "users", foundMember.id))).data();
      const hashed = await hashPassword(password);
      if (data.password === hashed) {
        setUser({ id: foundMember.id, ...data });
        localStorage.setItem("npd_portal_id", foundMember.id);
        setView("home");
      } else {
        setAuthError("Incorrect password. Try again.");
      }
    } catch {
      setAuthError("Connection error. Try again.");
    }
    setAuthLoading(false);
  };

  const handleCreatePassword = async () => {
    setAuthError("");
    const errors = validatePassword(password);
    if (errors.length) {
      setPwErrors(errors);
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthLoading(true);
    try {
      const hashed = await hashPassword(password);
      const profile = {
        name: foundMember.name,
        password: hashed,
        role: ADMIN_IDS.includes(foundMember.id) ? "admin" : "user",
      };
      await setDoc(doc(db, "users", foundMember.id), profile);
      localStorage.setItem("npd_portal_id", foundMember.id);
      setUser({ id: foundMember.id, ...profile });
      setView("home");
    } catch {
      setAuthError("Failed to create account. Try again.");
    }
    setAuthLoading(false);
  };

  // FIX: single-write guard on publish
  const publishQuiz = async () => {
    if (isPublishing) return;
    if (!newQuizTitle.trim()) return alert("Enter a quiz title.");
    if (!addedQuestions.length) return alert("Add at least one question.");
    if (postType === "later" && !scheduledAt)
      return alert("Please choose a go-live date & time.");

    const quizPayload = {
      title: newQuizTitle,
      questions: addedQuestions,
      author: user.name,
      deadline,
      createdAt: new Date(),
      scheduledAt: postType === "later" ? scheduledAt : null,
      exemptUsers: exemptUsers,
    };

    // Estimate payload size (limit is 1MB in Firestore)
    const estimatedSize = JSON.stringify(quizPayload).length;
    if (estimatedSize > 950 * 1024) {
      setIsPublishing(false);
      return alert(
        `⚠️ Cannot publish quiz: The total size of this quiz with all uploaded images is too large (${Math.round(
          estimatedSize / 1024
        )} KB) and exceeds the database limit of 1MB. Please remove some images or upload smaller ones.`
      );
    }

    setIsPublishing(true);
    try {
      await addDoc(collection(db, "quizzes"), quizPayload);
      const msg =
        postType === "later"
          ? `📅 Quiz scheduled for ${new Date(scheduledAt).toLocaleString(
              "en-IN",
              { timeZone: "Asia/Kolkata" }
            )} IST`
          : "🚀 Quiz published!";
      setView("home");
      setAddedQuestions([]);
      setNewQuizTitle("");
      setDeadline("");
      setScheduledAt("");
      setPostType("now");
      setExemptUsers([]);
      setShowMetaPanel(true);
      setTimeout(() => alert(msg), 150);
    } catch {
      alert("Failed to publish. Try again.");
    }
    setIsPublishing(false);
  };

  const addQuestion = () => {
    if (!qText.trim()) return alert("Enter a question.");
    setAddedQuestions([
      ...addedQuestions,
      {
        type: qType,
        text: qText,
        image: qImage || null,
        options: qType === "MCQ" ? [...mcqOptions] : null,
        correct: qType === "MCQ" ? mcqOptions[correctIdx] : ansKey,
      },
    ]);
    setQText("");
    setAnsKey("");
    setQImage(null);
    setMcqOptions(["", "", "", ""]);
    setCorrectIdx(0);
  };

  const doLogout = () => {
    exitFullscreen();
    localStorage.removeItem("npd_portal_id");
    setUser(null);
    setLoginStep("id");
    setAuthCode("");
    setPassword("");
    setConfirmPassword("");
    setFoundMember(null);
    setAuthError("");
    setActiveQuiz(null);
    setUserAnswers({});
    setStrikes(0);
    setCurrentQIdx(0);
    submittingRef.current = false;
    setIsSubmitting(false);
    setView("home");
  };

  const logout = () => {
    if (activeQuiz) {
      if (
        !window.confirm(
          "You are in the middle of a quiz!\n\nLogging out will auto-submit your current answers. Are you sure?"
        )
      )
        return;
      (async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        let score = 0;
        activeQuiz.questions.forEach((q, i) => {
          if (
            (userAnswers[i] || "").trim().toLowerCase() ===
            (q.correct || "").trim().toLowerCase()
          )
            score++;
        });
        try {
          await addDoc(collection(db, "results"), {
            userId: user.id,
            userName: user.name,
            quizId: activeQuiz.id,
            quizTitle: activeQuiz.title,
            score,
            total: activeQuiz.questions.length,
            responses: userAnswers,
            submittedAt: new Date(),
            flagged: false,
            note: "Auto-submitted on logout",
          });
        } catch (e) {
          console.error(e);
        }
        doLogout();
      })();
      return;
    }
    doLogout();
  };

  // ── Loading screen ──
  if (loading)
    return (
      <>
        <style>{STYLES}</style>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
            <div
              className="pulse"
              style={{
                color: "var(--teal)",
                fontFamily: "'DM Mono',monospace",
                fontSize: 13,
                letterSpacing: "0.1em",
              }}
            >
              SYNCHRONIZING SYSTEMS
            </div>
          </div>
        </div>
      </>
    );

  const myResults = results.filter((r) => r.userId === user?.id);
  const myScore = myResults.reduce((s, c) => s + (c.score || 0), 0);

  // Only quizzes that are live (scheduledAt in past or null)
  const liveQuizzes = quizzes.filter(
    (q) => !q.scheduledAt || new Date(q.scheduledAt) <= new Date()
  );
  const pendingCount = liveQuizzes.filter(
    (q) =>
      !results.some((r) => r.userId === user?.id && r.quizId === q.id) &&
      !(q.exemptUsers && q.exemptUsers.includes(user?.id))
  ).length;

  const NAV_ITEMS = [
    { icon: "🏠", key: "home", label: "Home" },
    { icon: "🎯", key: "attend", label: "Attend Quiz", badge: pendingCount },
    { icon: "📖", key: "archive", label: "Solutions" },
    { icon: "➕", key: "post", label: "Post Quiz" },
    { icon: "🏆", key: "ranking", label: "Rankings" },
    ...(ADMIN_IDS.includes(user?.id)
      ? [{ icon: "📈", key: "admin", label: "Lead Hub" }]
      : []),
  ];

  // Nav disabled while quiz is active
  const navLocked = !!activeQuiz;

  return (
    <>
      <style>{STYLES}</style>

      {showDraftModal && (
        <DraftModal
          questions={addedQuestions}
          onClose={() => setShowDraftModal(false)}
          onDelete={(i) =>
            setAddedQuestions(addedQuestions.filter((_, x) => x !== i))
          }
          onEdit={(i, u) => {
            const n = [...addedQuestions];
            n[i] = u;
            setAddedQuestions(n);
          }}
        />
      )}

      {reviewResult && (
        <ResultReviewModal
          result={reviewResult}
          quiz={quizzes.find((q) => q.id === reviewResult.quizId)}
          onClose={() => setReviewResult(null)}
        />
      )}

      <div style={{ minHeight: "100vh" }}>
        {/* ── HEADER ── */}
        <header
          style={{
            background: scrolled ? "var(--header-bg)" : "var(--header-bg-idle)",
            backdropFilter: "blur(12px)",
            borderBottom: scrolled
              ? "1px solid var(--header-border-scroll)"
              : "1px solid var(--header-border-idle)",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ maxWidth: 800, margin: "auto" }}>
            {/* Brand row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 56,
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flex: 1,
                }}
              >
                <div
                  className="pulse"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--teal)",
                    boxShadow: "0 0 8px var(--teal)",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--teal)",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    CTC PORTAL
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      fontFamily: "'DM Mono',monospace",
                      background: "var(--teal-dim)",
                      color: "var(--teal)",
                      border: "1px solid var(--border-teal)",
                      padding: "1px 5px",
                      borderRadius: 4,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    v2.0
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-dim)",
                }}
              >
                Chennai Technology Center
              </span>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <button
                  onClick={toggleDarkMode}
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    color: "var(--text-dim)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: 0,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-teal)";
                    e.currentTarget.style.color = "var(--teal)";
                    e.currentTarget.style.boxShadow = "0 0 8px var(--teal-glow)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-dim)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {darkMode ? "☀️" : "🌙"}
                </button>
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Emerson_Electric_Company.svg/3840px-Emerson_Electric_Company.svg.png"
                  style={{
                    height: 28,
                    filter: darkMode ? "brightness(0) invert(1)" : "none",
                    opacity: darkMode ? 0.7 : 1,
                  }}
                  alt="Emerson"
                />
                {user && (
                  <button className="btn-ghost" onClick={logout}>
                    LOGOUT
                  </button>
                )}
              </div>
            </div>

            {/* ── TOP NAV — disabled during quiz ── */}
            {user && (
              <div
                style={{
                  display: "flex",
                  borderTop: "1px solid var(--border)",
                }}
              >
                {NAV_ITEMS.map((n) => (
                  <button
                    key={n.key}
                    className={`top-nav-btn${view === n.key ? " active" : ""}`}
                    disabled={navLocked}
                    title={navLocked ? "Finish your quiz first" : n.label}
                    onClick={() => {
                      if (navLocked) return;
                      setArchiveQuiz(null);
                      setView(n.key);
                    }}
                    style={{
                      opacity: navLocked ? 0.25 : view === n.key ? 1 : 0.45,
                      position: "relative",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{n.icon}</span>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: "'DM Mono',monospace",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color:
                          view === n.key ? "var(--teal)" : "var(--text-faint)",
                        fontWeight: 600,
                      }}
                    >
                      {n.label}
                    </span>
                    {/* Pending badge on Attend Quiz */}
                    {n.badge > 0 && !navLocked && (
                      <span className="nav-badge">{n.badge}</span>
                    )}
                    {!navLocked && (
                      <span className="nav-tooltip">{n.label}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div
          style={{ maxWidth: 800, margin: "auto", padding: "24px 20px 60px" }}
        >
          {/* ══ LOGIN ══ */}
          {!user && (
            <div
              className="fadeIn"
              style={{
                display: "flex",
                gap: 24,
                alignItems: "stretch",
                flexWrap: "wrap",
              }}
            >
              {/* Hero image */}
              <div
                className="glass-panel"
                style={{
                  flex: "1 1 360px",
                  padding: 0,
                  overflow: "hidden",
                  height: 520,
                  position: "relative",
                }}
              >
                <img
                  src="https://i.pinimg.com/736x/af/b3/fc/afb3fc03fbdb8b173a7f9fc1d6f743ec.jpg"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.65,
                  }}
                  alt="Engineering"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, var(--navy) 10%, rgba(5,8,20,0) 80%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 32,
                    left: 32,
                    right: 32,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--teal)",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontFamily: "var(--font-mono)",
                      marginBottom: 10,
                      fontWeight: 700,
                    }}
                  >
                    NPD Division
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      lineHeight: 1.2,
                      letterSpacing: "0.02em",
                      color: "#fff",
                    }}
                  >
                    Team Portal
                  </div>
                </div>
              </div>

              {/* Auth panel */}
              <div className="glass-panel" style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {/* Step: ID */}
                  {loginStep === "id" && (
                    <div className="slideIn">
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          color: "var(--teal)",
                          textTransform: "uppercase",
                          fontFamily: "'DM Mono',monospace",
                          marginBottom: 6,
                        }}
                      >
                        — Portal Access
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        Welcome
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-dim)",
                          marginBottom: 20,
                        }}
                      >
                        Enter your Username to continue
                      </div>
                      <input
                        className={`field${authError ? " error" : ""}`}
                        placeholder="Employee ID"
                        value={authCode}
                        onChange={(e) => {
                          setAuthCode(e.target.value);
                          setAuthError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleIdSubmit()}
                      />
                      {authError && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--red)",
                            marginBottom: 10,
                            marginTop: -8,
                          }}
                        >
                          {authError}
                        </div>
                      )}
                      <button
                        className="btn-primary"
                        onClick={handleIdSubmit}
                        disabled={authLoading || !authCode.trim()}
                      >
                        {authLoading ? "Checking..." : "Continue →"}
                      </button>
                    </div>
                  )}

                  {/* Step: Password */}
                  {loginStep === "password" && (
                    <div className="slideIn">
                      <button
                        className="btn-back"
                        onClick={() => {
                          setLoginStep("id");
                          setPassword("");
                          setAuthError("");
                        }}
                      >
                        ← Back
                      </button>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 20,
                        }}
                      >
                        <Avatar name={foundMember.name} size={40} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>
                            {foundMember.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-faint)",
                              fontFamily: "'DM Mono',monospace",
                            }}
                          >
                            {foundMember.id}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-dim)",
                          marginBottom: 10,
                        }}
                      >
                        Enter your password
                      </div>
                      <PwField
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setAuthError("");
                        }}
                        placeholder="Password"
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        hasError={!!authError}
                      />
                      {authError && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--red)",
                            marginBottom: 10,
                            marginTop: -4,
                          }}
                        >
                          {authError}
                        </div>
                      )}
                      <button
                        className="btn-primary"
                        onClick={handleLogin}
                        disabled={authLoading || !password}
                      >
                        {authLoading ? "Signing in..." : "Sign In"}
                      </button>
                    </div>
                  )}

                  {/* Step: Create */}
                  {loginStep === "create" && (
                    <div className="slideIn">
                      <button
                        className="btn-back"
                        onClick={() => {
                          setLoginStep("id");
                          setPassword("");
                          setConfirmPassword("");
                          setAuthError("");
                          setPwErrors([]);
                        }}
                      >
                        ← Back
                      </button>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <Avatar name={foundMember.name} size={40} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>
                            {foundMember.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--green)",
                              fontFamily: "'DM Mono',monospace",
                            }}
                          >
                            New Account
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-dim)",
                          marginBottom: 10,
                        }}
                      >
                        Create your account password
                      </div>
                      <PwField
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPwErrors([]);
                          setAuthError("");
                        }}
                        placeholder="Create password"
                      />
                      {password && (
                        <div
                          style={{
                            background: "var(--navy3)",
                            borderRadius: 10,
                            padding: "10px 14px",
                            marginBottom: 12,
                            marginTop: -4,
                          }}
                        >
                          {[
                            {
                              rule: "At least 6 characters",
                              pass: password.length >= 6,
                            },
                            {
                              rule: "At least 1 uppercase letter",
                              pass: /[A-Z]/.test(password),
                            },
                            {
                              rule: "At least 1 symbol (e.g. @, #, !)",
                              pass: /[^a-zA-Z0-9]/.test(password),
                            },
                          ].map((r, i) => (
                            <div
                              key={i}
                              className={`pw-rule ${r.pass ? "pass" : "fail"}`}
                            >
                              <span>{r.pass ? "✓" : "○"}</span> {r.rule}
                            </div>
                          ))}
                        </div>
                      )}
                      <PwField
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setAuthError("");
                        }}
                        placeholder="Confirm password"
                        hasError={!!authError}
                      />
                      {authError && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--red)",
                            marginBottom: 10,
                            marginTop: -4,
                          }}
                        >
                          {authError}
                        </div>
                      )}
                      <button
                        className="btn-primary"
                        onClick={handleCreatePassword}
                        disabled={authLoading || !password || !confirmPassword}
                      >
                        {authLoading ? "Creating..." : "Create Account"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
          )}

          {/* ══ LOGGED IN ══ */}
          {user && (
            <div className="fadeIn">
              {/* User strip */}
              <div
                className="glass-panel"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "20px 24px",
                  marginBottom: 24,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 200 }}>
                  <Avatar name={user.name} size={48} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: "var(--text)", letterSpacing: "-0.01em" }}>
                      {user.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-faint)",
                        fontFamily: "var(--font-mono)",
                        marginTop: 3,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {user.id}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <StatChip label="Tests" value={myResults.length} />
                  <StatChip
                    label="Points"
                    value={myScore}
                    accent="var(--amber)"
                  />
                </div>
              </div>
              {/* ── HOME ── */}
              {view === "home" && (
                <div className="dashboard-grid">
                  {[
                    {
                      icon: "🎯",
                      label: "Attend Quiz",
                      sub: "Take active tests",
                      target: "attend",
                      accent: "var(--teal)",
                    },
                    {
                      icon: "📖",
                      label: "Solutions Archive",
                      sub: "Gated answer keys",
                      target: "archive",
                      accent: "var(--amber)",
                    },
                    {
                      icon: "➕",
                      label: "Post Quiz",
                      sub: "Build & publish tests",
                      target: "post",
                      accent: "var(--green)",
                    },
                    {
                      icon: "🏆",
                      label: "Leaderboard",
                      sub: "Rankings & history",
                      target: "ranking",
                      accent: "#a78bfa",
                    },
                  ].map((c) => (
                    <div
                      key={c.target}
                      className={`menu-card ${
                        c.target === "attend"
                          ? "menu-teal"
                          : c.target === "archive"
                          ? "menu-amber"
                          : c.target === "post"
                          ? "menu-green"
                          : "menu-purple"
                      }`}
                      onClick={() => setView(c.target)}
                    >
                      <div style={{ fontSize: 32, marginBottom: 12 }}>
                        {c.icon}
                      </div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          marginBottom: 6,
                          color: "var(--text)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {c.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.4 }}>
                        {c.sub}
                      </div>
                      <div
                        style={{
                          marginTop: 18,
                          height: 3,
                          width: c.target === "attend" && pendingCount > 0 ? 0 : 40,
                          background: c.accent,
                          borderRadius: 2,
                          boxShadow: `0 2px 8px ${c.accent}`,
                        }}
                      />
                      {/* Pending badge on Attend Quiz card */}
                      {c.target === "attend" && pendingCount > 0 && (
                        <span className="home-badge">
                          {pendingCount} pending
                        </span>
                      )}
                    </div>
                  ))}
                  {ADMIN_IDS.includes(user.id) && (
                    <div
                      className="menu-card menu-red"
                      onClick={() => setView("admin")}
                      style={{
                        gridColumn: "1 / -1",
                        border: "1px solid rgba(244, 63, 94, 0.25)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ fontSize: 32 }}>📈</div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", letterSpacing: "-0.01em" }}>
                            Lead Hub — Audits
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--text-faint)",
                              marginTop: 4,
                            }}
                          >
                            Team performance management
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--red)",
                            letterSpacing: "0.1em",
                            fontFamily: "var(--font-mono)",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            background: "var(--red-dim)",
                            padding: "6px 14px",
                            borderRadius: 20,
                          }}
                        >
                          ADMIN HUB
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* ── ATTEND LIST ── */}
              {view === "attend" && !activeQuiz && (
                <div className="fadeIn">
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--teal)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'DM Mono',monospace",
                      }}
                    >
                      Active Tests
                    </div>
                    <div
                      style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}
                    >
                      Available Quizzes
                    </div>
                  </div>

                  {/* Scheduled (not yet live) */}
                  {quizzes
                    .filter(
                      (q) =>
                        q.scheduledAt && new Date(q.scheduledAt) > new Date()
                    )
                    .map((q) => (
                      <div
                        key={q.id}
                        className="glass-panel"
                        style={{
                          marginBottom: 16,
                          opacity: 0.6,
                          borderStyle: "dashed",
                          borderWidth: "1px",
                          borderColor: "var(--amber)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <span className="sched-badge">🕐 Scheduled</span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--amber)",
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                            }}
                          >
                            {new Date(q.scheduledAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            IST
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>
                          {q.title}
                        </div>
                      </div>
                    ))}

                  {/* Live quizzes */}
                  {liveQuizzes.map((q) => {
                    const isExempt =
                      q.exemptUsers && q.exemptUsers.includes(user.id);
                    const done =
                      results.some(
                        (r) => r.userId === user.id && r.quizId === q.id
                      ) || isExempt;
                    return (
                      <div
                        key={q.id}
                        className="glass-panel glass-panel-hover"
                        style={{
                          marginBottom: 16,
                          opacity: done ? 0.6 : 1,
                          borderLeft: isExempt
                            ? "4px solid var(--purple)"
                            : done
                            ? "4px solid var(--green)"
                            : "4px solid var(--teal)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-faint)",
                              fontFamily: "var(--font-mono)",
                              fontWeight: 600,
                            }}
                          >
                            👤 {q.author || "Lead"}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--red)",
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                            }}
                          >
                            ⏱ {q.deadline || "No Limit"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 16,
                            marginBottom: 18,
                            color: "var(--text)",
                          }}
                        >
                          {q.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          {isExempt ? (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--purple)",
                                fontWeight: 800,
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.05em",
                              }}
                            >
                              EXEMPT ✦
                            </span>
                          ) : !done ? (
                            <button
                              className="btn-ghost"
                              onClick={() => startQuiz(q)}
                            >
                              START TEST →
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--green)",
                                fontWeight: 800,
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              COMPLETED ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {liveQuizzes.length === 0 && (
                    <div
                      style={{
                        color: "var(--text-faint)",
                        fontSize: 13,
                        marginTop: 8,
                      }}
                    >
                      No active quizzes right now.
                    </div>
                  )}
                </div>
              )}
              {/* ── ACTIVE QUIZ — one question per page ── */}
              {activeQuiz && (
                <div
                  className="fadeIn no-select"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div className="watermark" aria-hidden="true">
                    {user.name}
                    {"\n"}
                    {user.id}
                    {"\n"}
                    {user.name}
                    {"\n"}
                    {user.id}
                  </div>

                  {/* Strike warning */}
                  {showWarning && (
                    <div className="strike-overlay">
                      <div className="strike-box">
                        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "var(--red)",
                            marginBottom: 8,
                            letterSpacing: "0.04em",
                          }}
                        >
                          INTEGRITY ALERT
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text-dim)",
                            marginBottom: 20,
                            lineHeight: 1.6,
                          }}
                        >
                          {warningReason} was detected.
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            justifyContent: "center",
                            marginBottom: 20,
                          }}
                        >
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background:
                                  strikes >= n ? "var(--red)" : "var(--navy3)",
                                border: `2px solid ${
                                  strikes >= n ? "var(--red)" : "var(--border)"
                                }`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 700,
                                color:
                                  strikes >= n ? "#fff" : "var(--text-faint)",
                                transition: "all 0.3s",
                              }}
                            >
                              {n}
                            </div>
                          ))}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-faint)",
                            marginBottom: 20,
                          }}
                        >
                          {MAX_STRIKES - strikes} warning
                          {MAX_STRIKES - strikes !== 1 ? "s" : ""} remaining
                          before auto-submit
                        </div>
                        <button
                          className="btn-primary"
                          onClick={() => {
                            setShowWarning(false);
                            enterFullscreen();
                          }}
                        >
                          Return to Quiz
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quiz header */}
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--teal)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            fontFamily: "'DM Mono',monospace",
                          }}
                        >
                          Q {currentQIdx + 1} / {activeQuiz.questions.length}
                        </div>
                        {strikes > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: 5,
                              alignItems: "center",
                            }}
                          >
                            {[1, 2, 3].map((n) => (
                              <div
                                key={n}
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background:
                                    strikes >= n
                                      ? "var(--red)"
                                      : "var(--navy3)",
                                  border: `1px solid ${
                                    strikes >= n
                                      ? "var(--red)"
                                      : "var(--border)"
                                  }`,
                                }}
                              />
                            ))}
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--red)",
                                fontFamily: "'DM Mono',monospace",
                                marginLeft: 4,
                              }}
                            >
                              STRIKES
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Submit button — top right, always visible */}
                      <button
                        className="q-nav-btn submit-btn"
                        disabled={isSubmitting}
                        onClick={submitTest}
                        style={{
                          width: "auto",
                          padding: "6px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          flexShrink: 0,
                          flex: "none",
                          borderRadius: "8px",
                        }}
                      >
                        {isSubmitting ? "Saving…" : "Save & Submit ✓"}
                      </button>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      {activeQuiz.title}
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: 3,
                        background: "var(--navy3)",
                        borderRadius: 4,
                        marginTop: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "var(--teal)",
                          borderRadius: 4,
                          width: `${
                            ((currentQIdx + 1) / activeQuiz.questions.length) *
                            100
                          }%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    {/* Question dot navigator */}
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        flexWrap: "wrap",
                        marginTop: 12,
                      }}
                    >
                      {activeQuiz.questions.map((_, idx) => (
                        <div
                          key={idx}
                          className={`q-dot ${
                            idx === currentQIdx
                              ? "current"
                              : userAnswers[idx] !== undefined
                              ? "answered"
                              : "unanswered"
                          }`}
                          onClick={() => setCurrentQIdx(idx)}
                          title={`Q${idx + 1}`}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Single question card */}
                  {(() => {
                    const q = activeQuiz.questions[currentQIdx];
                    return (
                      <div
                        className="glass-panel"
                        style={{
                          marginBottom: 16,
                          padding: 28,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-faint)",
                            fontFamily: "var(--font-mono)",
                            marginBottom: 14,
                            fontWeight: 600,
                          }}
                        >
                          QUESTION {String(currentQIdx + 1).padStart(2, "0")} · <span style={{ color: "var(--teal)" }}>{q.type}</span>
                        </div>
                        {q.image && (
                          <div style={{ display: "inline-block", position: "relative", overflow: "hidden", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 18, width: "100%" }}>
                            <img
                              src={q.image}
                              style={{
                                width: "100%",
                                display: "block",
                                maxHeight: 380,
                                objectFit: "contain",
                                background: "rgba(0,0,0,0.15)",
                              }}
                              alt="Visual question reference"
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          </div>
                        )}
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: 17,
                            marginBottom: 24,
                            lineHeight: 1.6,
                            color: "var(--text)",
                          }}
                        >
                          {q.text}
                        </p>
                        {q.options ? (
                          q.options.map((opt, idx) => {
                            const isSelected = userAnswers[currentQIdx] === opt;
                            return (
                              <button
                                key={idx}
                                className={`option-btn${isSelected ? " selected" : ""}`}
                                onClick={() =>
                                  setUserAnswers({
                                    ...userAnswers,
                                    [currentQIdx]: opt,
                                  })
                                }
                              >
                                <span
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    background: isSelected ? "var(--teal)" : "var(--navy)",
                                    color: isSelected ? "var(--navy)" : "var(--text-faint)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    fontFamily: "var(--font-mono)",
                                    marginRight: 14,
                                    flexShrink: 0,
                                    transition: "all 0.2s",
                                    border: isSelected ? "none" : "1px solid var(--border)",
                                  }}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span style={{ flex: 1, color: isSelected ? "var(--teal)" : "var(--text-dim)", fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
                              </button>
                            );
                          })
                        ) : (
                          <input
                            className="field"
                            style={{ marginBottom: 0 }}
                            placeholder="Type your answer here..."
                            value={userAnswers[currentQIdx] || ""}
                            onChange={(e) =>
                              setUserAnswers({
                                ...userAnswers,
                                [currentQIdx]: e.target.value,
                              })
                            }
                          />
                        )}
                      </div>
                    );
                  })()}

                  {/* Prev / Next */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button
                      className="q-nav-btn"
                      disabled={currentQIdx === 0}
                      onClick={() => setCurrentQIdx((i) => i - 1)}
                    >
                      ← Previous
                    </button>
                    <button
                      className="q-nav-btn"
                      disabled={currentQIdx >= activeQuiz.questions.length - 1}
                      onClick={() => setCurrentQIdx((i) => i + 1)}
                    >
                      Save &amp; Next →
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-faint)",
                      textAlign: "center",
                    }}
                  >
                    {Object.keys(userAnswers).length} /{" "}
                    {activeQuiz.questions.length} answered — click any number to
                    jump
                  </div>
                </div>
              )}
              {/* ── ARCHIVE LIST ── */}
              {view === "archive" && !archiveQuiz && (
                <div className="fadeIn">
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--amber)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'DM Mono',monospace",
                      }}
                    >
                      Gated Access
                    </div>
                    <div
                      style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}
                    >
                      Solutions Archive
                    </div>
                  </div>

                  <input
                    className="field"
                    placeholder="🔍 Search quizzes in archive..."
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    style={{ marginBottom: 16 }}
                  />

                  {quizzes
                    .filter((q) => {
                      if (!archiveSearch.trim()) return true;
                      return q.title.toLowerCase().includes(archiveSearch.trim().toLowerCase());
                    })
                    .map((q) => {
                      const isExempt =
                        q.exemptUsers && q.exemptUsers.includes(user.id);
                      const hasTaken =
                        results.some(
                          (r) => r.userId === user.id && r.quizId === q.id
                        ) || isExempt;
                      return (
                        <div
                          key={q.id}
                          className={hasTaken ? "glass-panel glass-panel-hover" : "glass-panel"}
                          style={{
                            padding: "16px 20px",
                            marginBottom: 12,
                            opacity: hasTaken ? 1 : 0.5,
                            cursor: hasTaken ? "pointer" : "default",
                            borderLeft: hasTaken ? "4px solid var(--green)" : "4px solid var(--text-faint)",
                          }}
                          onClick={() =>
                            hasTaken
                              ? setArchiveQuiz(q)
                              : alert(
                                  "Complete the quiz first to unlock solutions."
                                )
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
                              {q.title}
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.08em",
                                fontWeight: 700,
                                color: hasTaken
                                  ? "var(--green)"
                                  : "var(--text-faint)",
                              }}
                            >
                              {hasTaken ? "🔓 UNLOCKED" : "🔒 LOCKED"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
              {/* ── MY SUBMISSIONS — shown in archive tab ── */}
              {view === "archive" && !archiveQuiz && (
                <div style={{ marginTop: 28 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--teal)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: "'DM Mono',monospace",
                      marginBottom: 4,
                    }}
                  >
                    My Results
                  </div>
                  <div
                    style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}
                  >
                    My Submissions
                  </div>
                  {myResults.length === 0 && (
                    <div style={{ color: "var(--text-faint)", fontSize: 13 }}>
                      No tests taken yet.
                    </div>
                  )}
                  {myResults.map((res, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 14,
                        padding: "14px 18px",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
                            {res.quizTitle}
                            {res.flagged && (
                              <span
                                style={{
                                  fontSize: 9,
                                  background: "rgba(239,68,68,0.15)",
                                  color: "var(--red)",
                                  border: "1px solid rgba(239,68,68,0.3)",
                                  padding: "1px 6px",
                                  borderRadius: 10,
                                  fontFamily: "'DM Mono',monospace",
                                  fontWeight: 700,
                                }}
                              >
                                🚩 FLAGGED
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-faint)",
                              fontFamily: "'DM Mono',monospace",
                              marginTop: 3,
                            }}
                          >
                            {new Date(
                              res.submittedAt.seconds * 1000
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'DM Mono',monospace",
                              fontSize: 18,
                              fontWeight: 700,
                              color:
                                res.score / res.total >= 0.7
                                  ? "var(--green)"
                                  : "var(--amber)",
                            }}
                          >
                            {res.score}
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--text-faint)",
                              }}
                            >
                              /{res.total}
                            </span>
                          </div>
                          <button
                            className="btn-ghost"
                            style={{ fontSize: 11, padding: "6px 12px" }}
                            onClick={() => setReviewResult(res)}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* ── ARCHIVE DETAIL — all options shown, correct highlighted ── */}
              {archiveQuiz && (
                <div className="fadeIn">
                  <button
                    className="btn-back"
                    onClick={() => setArchiveQuiz(null)}
                  >
                    ← Back
                  </button>
                  <div
                    style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}
                  >
                    {archiveQuiz.title}
                  </div>
                  {archiveQuiz.questions.map((q, i) => (
                    <div
                      key={i}
                      className="glass-panel"
                      style={{
                        marginBottom: 16,
                        padding: 24,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-faint)",
                          fontFamily: "var(--font-mono)",
                          marginBottom: 10,
                          fontWeight: 600,
                        }}
                      >
                        QUESTION {String(i + 1).padStart(2, "0")} · <span style={{ color: "var(--teal)" }}>{q.type}</span>
                      </div>
                      {q.image && (
                        <div style={{ display: "inline-block", position: "relative", overflow: "hidden", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 14, width: "100%" }}>
                          <img
                            src={q.image}
                            style={{
                              width: "100%",
                              display: "block",
                              maxHeight: 280,
                              objectFit: "contain",
                              background: "rgba(0,0,0,0.15)",
                            }}
                            alt="Visual reference"
                          />
                        </div>
                      )}
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          marginBottom: 16,
                          lineHeight: 1.5,
                          color: "var(--text)",
                        }}
                      >
                        {q.text}
                      </p>

                      {/* MCQ — all options, correct marked green */}
                      {q.options ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {q.options.map((opt, oi) => {
                            const isCorrect = opt === q.correct;
                            return (
                              <div
                                key={oi}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  padding: "12px 16px",
                                  borderRadius: 12,
                                  fontSize: 14,
                                  background: isCorrect
                                    ? "var(--green-dim)"
                                    : "var(--navy3)",
                                  border: `1px solid ${
                                    isCorrect
                                      ? "rgba(16,185,129,0.3)"
                                      : "var(--border)"
                                  }`,
                                  color: isCorrect
                                    ? "var(--green)"
                                    : "var(--text-dim)",
                                  fontWeight: isCorrect ? 700 : 400,
                                }}
                              >
                                <span
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 6,
                                    background: isCorrect ? "var(--green)" : "var(--navy)",
                                    color: isCorrect ? "var(--navy)" : "var(--text-faint)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    flexShrink: 0,
                                    border: isCorrect ? "none" : "1px solid var(--border)",
                                  }}
                                >
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                <span style={{ flex: 1 }}>{opt}</span>
                                {isCorrect && (
                                  <span style={{ fontSize: 16, fontWeight: 800 }}>✓</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Fill-blank: just show correct answer */
                        <div
                          style={{
                            background: "var(--green-dim)",
                            border: "1px solid rgba(16,185,129,0.3)",
                            borderRadius: 12,
                            padding: "12px 16px",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--green)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 15, fontWeight: 800 }}>✓ Correct Answer:</span> {q.correct}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* ── POST QUIZ ── */}
              {view === "post" && (
                <div className="fadeIn">
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--green)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'DM Mono',monospace",
                      }}
                    >
                      Quiz Builder
                    </div>
                    <div
                      style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}
                    >
                      Create New Quiz
                    </div>
                  </div>

                  {/* ── Quiz Details — collapsible ── */}
                  <div
                    style={{
                      background: "var(--panel)",
                      border: `1px solid ${
                        showMetaPanel ? "var(--border-teal)" : "var(--border)"
                      }`,
                      borderRadius: 18,
                      marginBottom: 16,
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* Header bar — always visible, click to toggle */}
                    <div
                      onClick={() => setShowMetaPanel((v) => !v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 0,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>📋</span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--green)",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              fontFamily: "'DM Mono',monospace",
                            }}
                          >
                            Quiz Details
                          </div>
                          {!showMetaPanel && (
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: newQuizTitle
                                  ? "var(--text)"
                                  : "var(--text-faint)",
                                marginTop: 2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "55vw",
                              }}
                            >
                              {newQuizTitle || "Untitled quiz"}
                              {deadline && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-faint)",
                                    fontWeight: 400,
                                    marginLeft: 8,
                                  }}
                                >
                                  · {deadline}
                                </span>
                              )}
                              {exemptUsers.length > 0 && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "#a78bfa",
                                    fontWeight: 400,
                                    marginLeft: 8,
                                  }}
                                >
                                  · {exemptUsers.length} exempt
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexShrink: 0,
                        }}
                      >
                        {!showMetaPanel && !newQuizTitle && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--red)",
                              fontFamily: "'DM Mono',monospace",
                              fontWeight: 700,
                            }}
                          >
                            TITLE REQUIRED
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 18,
                            color: "var(--text-faint)",
                            transition: "transform 0.2s",
                            display: "inline-block",
                            transform: showMetaPanel
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          ⌄
                        </span>
                      </div>
                    </div>

                    {/* Expandable content */}
                    {showMetaPanel && (
                      <div
                        className="slideIn"
                        style={{ padding: "0 20px 20px" }}
                      >
                        <input
                          className="field"
                          placeholder="Quiz Title"
                          value={newQuizTitle}
                          onChange={(e) => setNewQuizTitle(e.target.value)}
                        />

                        <label
                          style={{
                            fontSize: 11,
                            color: "var(--text-faint)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            fontFamily: "'DM Mono',monospace",
                            display: "block",
                            marginBottom: 8,
                          }}
                        >
                          Deadline (optional)
                        </label>
                        <div style={{ position: "relative", marginBottom: 16 }}>
                          <input
                            type="date"
                            className="field"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            style={{
                              marginBottom: 0,
                              paddingRight: 44,
                              colorScheme: darkMode ? "dark" : "light",
                              color: deadline ? "var(--text)" : "var(--text-faint)",
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: 14,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: 18,
                              pointerEvents: "none",
                              userSelect: "none",
                            }}
                          >
                            📅
                          </span>
                        </div>

                        {/* Publish timing */}
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-faint)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            fontFamily: "'DM Mono',monospace",
                            marginBottom: 10,
                          }}
                        >
                          Publish Timing
                        </div>
                        <div
                          style={{ display: "flex", gap: 8, marginBottom: 14 }}
                        >
                          {[
                            { val: "now", label: "🚀 Post Now" },
                            { val: "later", label: "🕐 Schedule for Later" },
                          ].map((o) => (
                            <button
                              key={o.val}
                              onClick={() => setPostType(o.val)}
                              style={{
                                flex: 1,
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: "1px solid",
                                borderColor:
                                  postType === o.val
                                    ? "var(--teal)"
                                    : "var(--border)",
                                background:
                                  postType === o.val
                                    ? "var(--teal-dim)"
                                    : "transparent",
                                color:
                                  postType === o.val
                                    ? "var(--teal)"
                                    : "var(--text-dim)",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>

                        {postType === "later" && (
                          <div className="slideIn">
                            <label
                              style={{
                                fontSize: 11,
                                color: "var(--amber)",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                fontFamily: "'DM Mono',monospace",
                                display: "block",
                                marginBottom: 8,
                              }}
                            >
                              Go-Live Date &amp; Time (IST)
                            </label>
                            <input
                              type="datetime-local"
                              className="field"
                              value={scheduledAt}
                              onChange={(e) => setScheduledAt(e.target.value)}
                              style={{
                                colorScheme: darkMode ? "dark" : "light",
                                color: scheduledAt
                                  ? "var(--text)"
                                  : "var(--text-faint)",
                                marginBottom: scheduledAt ? 4 : 0,
                              }}
                            />
                            {scheduledAt && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--amber)",
                                  fontFamily: "'DM Mono',monospace",
                                  marginBottom: 4,
                                }}
                              >
                                Goes live:{" "}
                                {new Date(scheduledAt).toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                IST
                              </div>
                            )}
                          </div>
                        )}

                        {/* Exempt Members */}
                        <div style={{ marginTop: 16 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#a78bfa",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              fontFamily: "'DM Mono',monospace",
                              marginBottom: 6,
                            }}
                          >
                            Exempt Members (optional)
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-faint)",
                              marginBottom: 10,
                              lineHeight: 1.5,
                            }}
                          >
                            These members skip this quiz and can view solutions
                            directly.
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {TEAM_MEMBERS.map((m) => {
                              const sel = exemptUsers.includes(m.id);
                              return (
                                <button
                                  key={m.id}
                                  onClick={() =>
                                    setExemptUsers(
                                      sel
                                        ? exemptUsers.filter(
                                            (id) => id !== m.id
                                          )
                                        : [...exemptUsers, m.id]
                                    )
                                  }
                                  style={{
                                    padding: "5px 12px",
                                    borderRadius: 20,
                                    border: `1px solid ${
                                      sel ? "#a78bfa" : "var(--border)"
                                    }`,
                                    background: sel
                                      ? "rgba(167,139,250,0.15)"
                                      : "var(--navy3)",
                                    color: sel
                                      ? "#a78bfa"
                                      : "var(--text-faint)",
                                    fontSize: 12,
                                    fontWeight: sel ? 700 : 400,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                  }}
                                >
                                  {sel ? "✓ " : ""}
                                  {m.name.split(" ")[0]}
                                </button>
                              );
                            })}
                          </div>
                          {exemptUsers.length > 0 && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#a78bfa",
                                marginTop: 8,
                                fontFamily: "'DM Mono',monospace",
                              }}
                            >
                              {exemptUsers.length} member
                              {exemptUsers.length !== 1 ? "s" : ""} exempt
                              <button
                                onClick={() => setExemptUsers([])}
                                style={{
                                  marginLeft: 10,
                                  background: "none",
                                  border: "none",
                                  color: "var(--text-faint)",
                                  fontSize: 11,
                                  cursor: "pointer",
                                }}
                              >
                                clear
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Done button to collapse */}
                        <button
                          onClick={() => {
                            if (!newQuizTitle.trim()) {
                              alert("Please enter a quiz title first.");
                              return;
                            }
                            setShowMetaPanel(false);
                          }}
                          style={{
                            marginTop: 20,
                            width: "100%",
                            padding: "11px",
                            background: "var(--teal-dim)",
                            border: "1px solid var(--border-teal)",
                            borderRadius: 10,
                            color: "var(--teal)",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Done — Start Adding Questions ↓
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Question builder */}
                  <div
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 18,
                      padding: 24,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-faint)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontFamily: "'DM Mono',monospace",
                        marginBottom: 14,
                      }}
                    >
                      Question Type
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      {["MCQ", "Fill-Blank"].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setQType(t);
                            setQImage(null);
                          }}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: "1px solid",
                            borderColor:
                              qType === t ? "var(--teal)" : "var(--border)",
                            background:
                              qType === t ? "var(--teal-dim)" : "transparent",
                            color:
                              qType === t ? "var(--teal)" : "var(--text-dim)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {t === "MCQ" ? "MCQ" : "Fill in the Blank"}
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="field"
                      placeholder="Question text..."
                      value={qText}
                      rows={3}
                      onChange={(e) => setQText(e.target.value)}
                      style={{ resize: "vertical" }}
                    />

                    <div style={{ marginBottom: 4 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-faint)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          fontFamily: "'DM Mono',monospace",
                          marginBottom: 8,
                        }}
                      >
                        Attach Image (optional)
                      </div>
                      <ImageUploader value={qImage} onChange={setQImage} />
                    </div>

                    {qType === "MCQ" && (
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-faint)",
                            marginBottom: 10,
                            letterSpacing: "0.04em",
                          }}
                        >
                          Options — select radio to mark correct answer
                        </div>
                        {mcqOptions.map((o, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <input
                              type="radio"
                              checked={correctIdx === i}
                              onChange={() => setCorrectIdx(i)}
                              style={{
                                accentColor: "var(--teal)",
                                width: 16,
                                height: 16,
                                flexShrink: 0,
                              }}
                            />
                            <input
                              className="field"
                              style={{ flex: 1, marginBottom: 0 }}
                              value={o}
                              onChange={(e) => {
                                const n = [...mcqOptions];
                                n[i] = e.target.value;
                                setMcqOptions(n);
                              }}
                              placeholder={`Option ${String.fromCharCode(
                                65 + i
                              )}`}
                            />
                            {mcqOptions.length > 2 && (
                              <button
                                onClick={() => {
                                  const n = mcqOptions.filter(
                                    (_, x) => x !== i
                                  );
                                  setMcqOptions(n);
                                  if (correctIdx >= n.length)
                                    setCorrectIdx(n.length - 1);
                                  else if (correctIdx === i) setCorrectIdx(0);
                                  else if (correctIdx > i)
                                    setCorrectIdx(correctIdx - 1);
                                }}
                                style={{
                                  background: "rgba(239,68,68,0.08)",
                                  border: "1px solid rgba(239,68,68,0.25)",
                                  color: "var(--red)",
                                  borderRadius: 7,
                                  width: 28,
                                  height: 28,
                                  fontSize: 14,
                                  cursor: "pointer",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  lineHeight: 1,
                                }}
                                title="Remove option"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--teal)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            marginTop: 4,
                          }}
                          onClick={() => setMcqOptions([...mcqOptions, ""])}
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    {qType === "Fill-Blank" && (
                      <input
                        className="field"
                        placeholder="Correct Answer"
                        value={ansKey}
                        onChange={(e) => setAnsKey(e.target.value)}
                        style={{ marginTop: 4 }}
                      />
                    )}

                    <button
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "var(--navy3)",
                        border: "1px dashed var(--border-teal)",
                        borderRadius: 10,
                        color: "var(--teal)",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        marginTop: 16,
                      }}
                      onClick={addQuestion}
                    >
                      + Add Question
                    </button>
                  </div>

                  {addedQuestions.length > 0 && (
                    <button
                      onClick={() => setShowDraftModal(true)}
                      style={{
                        width: "100%",
                        padding: "12px 20px",
                        background: "rgba(0,212,184,0.07)",
                        border: "1px solid var(--border-teal)",
                        borderRadius: 12,
                        color: "var(--teal)",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'DM Mono',monospace",
                          background: "var(--teal)",
                          color: "var(--navy)",
                          borderRadius: 20,
                          padding: "1px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {addedQuestions.length}
                      </span>
                      Preview &amp; Edit Draft Questions
                    </button>
                  )}

                  <button
                    className="btn-primary"
                    style={{
                      background: isPublishing ? "#2a3a4a" : "var(--green)",
                      width: "auto",
                      padding: "10px 24px",
                      fontSize: 13,
                      margin: "0 auto",
                      display: "block",
                    }}
                    onClick={publishQuiz}
                    disabled={isPublishing}
                  >
                    {isPublishing
                      ? "Publishing…"
                      : postType === "later"
                      ? "Schedule Quiz 🕐"
                      : "Publish Quiz 🚀"}
                  </button>
                </div>
              )}
              {/* ── RANKING ── */}
              {view === "ranking" && (() => {
                const sortedRanks = TEAM_MEMBERS.map((m) => ({
                  ...m,
                  p: results
                    .filter((r) => r.userId === m.id)
                    .reduce((s, c) => s + (c.score || 0), 0),
                })).sort((a, b) => b.p - a.p);

                return (
                  <div className="fadeIn">
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#a78bfa",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          fontFamily: "'DM Mono',monospace",
                        }}
                      >
                        Rankings
                      </div>
                      <div
                        style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}
                      >
                        Leaderboard
                      </div>
                    </div>

                    <input
                      className="field"
                      placeholder="🔍 Search member by name or employee ID..."
                      value={leaderboardSearch}
                      onChange={(e) => setLeaderboardSearch(e.target.value)}
                      style={{ marginBottom: 16 }}
                    />

                    {/* Podium (Top 3) — Only shown when search is empty */}
                    {!leaderboardSearch.trim() && sortedRanks.length >= 3 && (
                      <div className="podium-container">
                        {/* 2nd Place */}
                        <div className="podium-step rank-2">
                          <div className="podium-badge">🥈</div>
                          <Avatar name={sortedRanks[1].name} size={42} />
                          <div style={{ fontWeight: 800, fontSize: 13, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", color: "var(--text)" }}>
                            {sortedRanks[1].name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                            {sortedRanks[1].id}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--purple)", marginTop: 4 }}>
                            {sortedRanks[1].p} pts
                          </div>
                        </div>

                        {/* 1st Place */}
                        <div className="podium-step rank-1">
                          <div className="podium-badge">👑</div>
                          <Avatar name={sortedRanks[0].name} size={50} />
                          <div style={{ fontWeight: 800, fontSize: 14, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", color: "var(--teal)" }}>
                            {sortedRanks[0].name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                            {sortedRanks[0].id}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--teal)", marginTop: 4 }}>
                            {sortedRanks[0].p} pts
                          </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="podium-step rank-3">
                          <div className="podium-badge">🥉</div>
                          <Avatar name={sortedRanks[2].name} size={40} />
                          <div style={{ fontWeight: 800, fontSize: 12, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", color: "var(--text)" }}>
                            {sortedRanks[2].name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                            {sortedRanks[2].id}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--amber)", marginTop: 4 }}>
                            {sortedRanks[2].p} pts
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Leaderboard table */}
                    <div
                      style={{
                        background: "var(--panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 18,
                        overflow: "hidden",
                        marginBottom: 24,
                      }}
                    >
                      {sortedRanks
                        .filter((r) => {
                          if (!leaderboardSearch.trim()) return true;
                          const q = leaderboardSearch.trim().toLowerCase();
                          return (
                            r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
                          );
                        })
                        .map((p, index) => {
                          const absoluteIndex = sortedRanks.findIndex((x) => x.id === p.id);
                          const medal =
                            absoluteIndex === 0
                              ? "🥇"
                              : absoluteIndex === 1
                              ? "🥈"
                              : absoluteIndex === 2
                              ? "🥉"
                              : null;
                          const isMe = p.id === user.id;

                          // Hide top 3 from list if no search query (since they are in the podium)
                          if (!leaderboardSearch.trim() && absoluteIndex < 3) return null;

                          return (
                            <div
                              key={p.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                padding: "14px 20px",
                                background: isMe
                                  ? "var(--teal-dim)"
                                  : "transparent",
                                borderBottom: "1px solid var(--border)",
                                borderLeft: isMe
                                  ? "3px solid var(--teal)"
                                  : "3px solid transparent",
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  textAlign: "center",
                                  fontFamily: "'DM Mono',monospace",
                                  fontSize: medal ? 16 : 12,
                                  color: "var(--text-faint)",
                                }}
                              >
                                {medal || `${absoluteIndex + 1}`}
                              </div>
                              <Avatar name={p.name} size={32} />
                              <div
                                style={{
                                  flex: 1,
                                  fontSize: 14,
                                  fontWeight: isMe ? 700 : 500,
                                }}
                              >
                                {p.name}
                                {isMe && (
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: 10,
                                      color: "var(--teal)",
                                      background: "var(--teal-dim)",
                                      padding: "1px 6px",
                                      borderRadius: 4,
                                      fontWeight: 700,
                                    }}
                                  >
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontFamily: "'DM Mono',monospace",
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: absoluteIndex < 3 ? "var(--amber)" : "var(--text)",
                                }}
                              >
                                {p.p}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })()}
              {/* ── ADMIN ── */} {/* ── ADMIN ── */}
              {view === "admin" && ADMIN_IDS.includes(user.id) && (
                <div className="fadeIn">
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--red)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'DM Mono',monospace",
                      }}
                    >
                      Admin
                    </div>
                    <div
                      style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}
                    >
                      Lead Hub
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--red)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: "'DM Mono',monospace",
                      marginBottom: 12,
                    }}
                  >
                    Team Audits
                  </div>
                  {TEAM_MEMBERS.map((m) => {
                    const count = results.filter(
                      (r) => r.userId === m.id
                    ).length;
                    const pts = results
                      .filter((r) => r.userId === m.id)
                      .reduce((s, c) => s + (c.score || 0), 0);
                    return (
                      <div
                        key={m.id}
                        className="glass-panel glass-panel-hover"
                        style={{
                          padding: "16px 20px",
                          marginBottom: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <Avatar name={m.name} size={40} />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              color: "var(--text)",
                            }}
                          >
                            {m.name}
                            {results.some(
                              (r) => r.userId === m.id && r.flagged
                            ) && (
                              <span
                                title="Has flagged attempt"
                                style={{
                                  fontSize: 9,
                                  background: "var(--red-dim)",
                                  color: "var(--red)",
                                  border: "1px solid rgba(244,63,94,0.3)",
                                  padding: "2px 8px",
                                  borderRadius: 12,
                                  fontFamily: "var(--font-mono)",
                                  letterSpacing: "0.08em",
                                  fontWeight: 700,
                                }}
                              >
                                🚩 FLAGGED
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--text-faint)",
                              fontFamily: "var(--font-mono)",
                              marginTop: 3,
                            }}
                          >
                            {count} test{count !== 1 ? "s" : ""} · {pts} pt{pts !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn-ghost"
                            style={{ padding: "9px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}
                            onClick={() => {
                              const hist = results.filter(
                                (r) => r.userId === m.id
                              );
                              const csv =
                                `Date,Quiz,Score,Total\n` +
                                hist
                                  .map(
                                    (r) =>
                                      `${new Date(
                                        r.submittedAt.seconds * 1000
                                      ).toLocaleDateString()},${r.quizTitle},${
                                        r.score
                                      },${r.total}`
                                  )
                                  .join("\n");
                              const b = new Blob([csv], { type: "text/csv" });
                              const a = document.createElement("a");
                              a.href = URL.createObjectURL(b);
                              a.download = `${m.name}.csv`;
                              a.click();
                            }}
                          >
                            CSV
                          </button>
                          <button
                            style={{
                              background: "rgba(244,63,94,0.08)",
                              border: "1px solid rgba(244,63,94,0.3)",
                              color: "var(--red)",
                              padding: "9px 14px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              letterSpacing: "0.04em",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--red)";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(244,63,94,0.08)";
                              e.currentTarget.style.color = "var(--red)";
                            }}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  `Reset password for ${m.name}? They will create a new one on next login. Quiz history is NOT affected.`
                                )
                              )
                                return;
                              await deleteDoc(doc(db, "users", m.id));
                              alert(
                                `${m.name}'s password reset. Quiz history is intact.`
                              );
                            }}
                          >
                            Reset PW
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
