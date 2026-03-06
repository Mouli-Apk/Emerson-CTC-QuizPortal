import React, { useState, useEffect } from "react";
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
  updateDoc,
  deleteDoc,
  serverTimestamp,
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

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --navy:#0a0f1e; --navy3:#1a2235; --panel:#141b2d;
    --teal:#00d4b8; --teal2:#00b89e; --teal-dim:rgba(0,212,184,0.12); --teal-glow:rgba(0,212,184,0.25);
    --amber:#f59e0b; --red:#ef4444; --green:#22c55e;
    --text:#edf2f7; --text-dim:#b8c8d8; --text-faint:#8096b0;
    --border:rgba(255,255,255,0.09); --border-teal:rgba(0,212,184,0.3);
  }
  body{background:var(--navy);color:var(--text);font-family:'Sora',sans-serif;}
  input,select,textarea,button{font-family:'Sora',sans-serif;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:var(--navy);}
  ::-webkit-scrollbar-thumb{background:var(--teal-glow);border-radius:2px;}
  .pulse{animation:pulse 2s ease-in-out infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  .fadeIn{animation:fadeIn 0.35s ease forwards;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .slideIn{animation:slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;}
  @keyframes slideIn{from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:translateX(0);}}
  .card-hover{transition:transform 0.2s,border-color 0.2s,box-shadow 0.2s;}
  .card-hover:hover{transform:translateY(-2px);border-color:var(--border-teal)!important;box-shadow:0 8px 32px rgba(0,212,184,0.1);}
  .btn-primary{width:100%;padding:14px 20px;background:var(--teal);color:var(--navy);border:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.04em;cursor:pointer;transition:background 0.2s,transform 0.15s;text-transform:uppercase;}
  .btn-primary:hover{background:var(--teal2);transform:translateY(-1px);}
  .btn-primary:disabled{background:#2a3a4a;color:#5a6a7a;cursor:not-allowed;transform:none;}
  .btn-ghost{background:none;border:1px solid var(--border-teal);color:var(--teal);padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;letter-spacing:0.05em;transition:background 0.2s;}
  .btn-ghost:hover{background:var(--teal-dim);}
  .btn-back{background:none;border:none;color:var(--text-faint);font-size:12px;font-weight:600;cursor:pointer;letter-spacing:0.05em;padding:0;display:flex;align-items:center;gap:6px;margin-bottom:18px;transition:color 0.2s;}
  .btn-back:hover{color:var(--teal);}
  .field{width:100%;background:var(--navy3);border:1px solid var(--border);color:var(--text);padding:13px 16px;border-radius:10px;font-size:14px;margin-bottom:12px;outline:none;transition:border-color 0.2s;}
  .field:focus{border-color:var(--border-teal);}
  .field::placeholder{color:var(--text-faint);}
  .field.error{border-color:var(--red);}
  .option-btn{width:100%;padding:13px 16px;margin-bottom:8px;border-radius:10px;border:1px solid var(--border);background:var(--navy3);color:var(--text);text-align:left;cursor:pointer;font-size:14px;font-family:'Sora',sans-serif;transition:border-color 0.2s,background 0.2s;}
  .option-btn:hover{border-color:var(--border-teal);background:var(--teal-dim);}
  .option-btn.selected{border-color:var(--teal);background:var(--teal-dim);color:var(--teal);font-weight:600;}
  .pw-rule{font-size:11px;padding:3px 0;display:flex;align-items:center;gap:6px;}
  .pw-rule.pass{color:var(--green);}
  .pw-rule.fail{color:var(--text-faint);}
  .modal-overlay{position:fixed;inset:0;background:rgba(5,8,18,0.85);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s ease;}
  .modal-box{background:var(--panel);border:1px solid var(--border-teal);border-radius:20px;padding:28px;width:100%;max-width:560px;max-height:82vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,0.6),0 0 40px rgba(0,212,184,0.08);}
  .draft-item{background:var(--navy);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:8px;transition:border-color 0.2s;}
  .draft-item:hover{border-color:rgba(0,212,184,0.2);}

  /* File upload button */
  input[type="file"]{display:none;}
  .file-upload-btn{display:flex;align-items:center;gap:8px;width:100%;padding:11px 16px;background:var(--navy3);border:1px dashed rgba(0,212,184,0.4);color:var(--teal);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:12px;transition:border-color 0.2s,background 0.2s;}
  .file-upload-btn:hover{background:var(--teal-dim);border-color:var(--teal);}

  /* Top nav */
  .top-nav-btn{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;border:none;background:none;padding:8px 14px;cursor:pointer;border-bottom:2px solid transparent;transition:border-color 0.2s,opacity 0.2s;flex:1;}
  .top-nav-btn.active{border-bottom-color:var(--teal);}
  .top-nav-btn:hover .nav-tooltip{opacity:1;transform:translateY(0);}
  .nav-tooltip{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(-4px);background:var(--navy3);border:1px solid var(--border-teal);color:var(--teal);font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-family:'DM Mono',monospace;padding:4px 10px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.2s,transform 0.2s;z-index:300;}
  .nav-tooltip::before{content:'';position:absolute;top:-5px;left:50%;transform:translateX(-50%);border:4px solid transparent;border-bottom-color:var(--border-teal);}

  /* Quiz security */
  .no-select{-webkit-user-select:none;-moz-user-select:none;user-select:none;}
  .watermark{
    position:fixed;inset:0;pointer-events:none;z-index:150;
    display:flex;align-items:center;justify-content:center;
    opacity:0.045;transform:rotate(-30deg);
    font-size:clamp(18px,4vw,32px);font-weight:900;color:#fff;
    font-family:'DM Mono',monospace;letter-spacing:0.08em;
    white-space:nowrap;text-align:center;line-height:1.8;
    text-transform:uppercase;
  }
  .strike-overlay{
    position:fixed;inset:0;z-index:500;background:rgba(5,5,15,0.93);
    display:flex;align-items:center;justify-content:center;padding:24px;
    animation:fadeIn 0.2s ease;
  }
  .strike-box{
    background:#12192b;border:1px solid rgba(239,68,68,0.5);border-radius:20px;
    padding:36px 32px;max-width:380px;width:100%;text-align:center;
    box-shadow:0 0 60px rgba(239,68,68,0.15);
  }
`;

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
                            const wasCorrect = editData.correct === opt;
                            o[oi] = e.target.value;
                            setEditData({
                              ...editData,
                              options: o,
                              correct: wasCorrect
                                ? e.target.value
                                : editData.correct,
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
                    style={{ padding: "10px 16px" }}
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

// Image upload helper — converts local file to base64 data URL
function ImageUploader({ value, onChange }) {
  const fileInputRef = React.useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFile}
      />
      <label
        className="file-upload-btn"
        onClick={() => fileInputRef.current.click()}
      >
        <span>📎</span>
        {value
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

export default function App() {
  const [loginStep, setLoginStep] = useState("id");
  const [authCode, setAuthCode] = useState("");
  const [foundMember, setFoundMember] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwErrors, setPwErrors] = useState([]);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [archiveQuiz, setArchiveQuiz] = useState(null);

  // ── QUIZ SECURITY STATE ──
  const [strikes, setStrikes] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const [quizFlagged, setQuizFlagged] = useState(false);
  const MAX_STRIKES = 3;

  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [qType, setQType] = useState("MCQ");
  const [qText, setQText] = useState("");
  const [qImage, setQImage] = useState(null); // base64 local image
  const [mcqOptions, setMcqOptions] = useState(["", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [ansKey, setAnsKey] = useState("");
  const [showDraftModal, setShowDraftModal] = useState(false);

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

  // ── QUIZ SECURITY: fullscreen + visibility + blur listeners ──
  useEffect(() => {
    if (!activeQuiz) return;
    const handleVisibility = () => {
      if (document.hidden) triggerStrike("Tab switch detected");
    };
    const handleBlur = () => {
      if (activeQuiz) triggerStrike("Window left");
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && activeQuiz)
        triggerStrike("Fullscreen exited");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
    // eslint-disable-next-line
  }, [activeQuiz]);

  const triggerStrike = (reason) => {
    setStrikes((prev) => {
      const next = prev + 1;
      setWarningReason(reason);
      if (next >= MAX_STRIKES) {
        setShowWarning(false);
        autoSubmitFlagged();
      } else {
        setShowWarning(true);
      }
      return next;
    });
  };

  const autoSubmitFlagged = async () => {
    setQuizFlagged(true);
    setActiveQuiz((q) => {
      if (!q) return q;
      (async (quiz) => {
        await addDoc(collection(db, "results"), {
          userId: user.id,
          userName: user.name,
          quizId: quiz.id,
          quizTitle: quiz.title,
          score: 0,
          total: quiz.questions.length,
          responses: {},
          submittedAt: new Date(),
          flagged: true,
          flagReason: "Auto-submitted: 3 integrity violations",
        });
      })(q);
      return null;
    });
    exitFullscreen();
    setUserAnswers({});
    setStrikes(0);
    setView("home");
    alert(
      "⚠️ Quiz auto-submitted due to 3 integrity violations. Your attempt has been flagged."
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
    setStrikes(0);
    setQuizFlagged(false);
    setShowWarning(false);
    setActiveQuiz(q);
    enterFullscreen();
  };

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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      setAuthError("Failed to create account. Try again.");
    }
    setAuthLoading(false);
  };

  const submitTest = async () => {
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
    exitFullscreen();
    alert(`Final Marks: ${score} / ${activeQuiz.questions.length}`);
    setActiveQuiz(null);
    setUserAnswers({});
    setStrikes(0);
    setView("home");
  };

  const publishQuiz = async () => {
    if (!newQuizTitle.trim()) return alert("Enter a quiz title");
    if (!addedQuestions.length) return alert("Add at least one question");
    await addDoc(collection(db, "quizzes"), {
      title: newQuizTitle,
      questions: addedQuestions,
      author: user.name,
      deadline,
      createdAt: new Date(),
    });
    alert("Quiz published!");
    setView("home");
    setAddedQuestions([]);
    setNewQuizTitle("");
    setDeadline("");
  };

  const addQuestion = () => {
    if (!qText.trim()) return alert("Enter a question");
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
    setMcqOptions(["", "", ""]);
    setCorrectIdx(0);
  };

  const logout = () => {
    localStorage.removeItem("npd_portal_id");
    setUser(null);
    setLoginStep("id");
    setAuthCode("");
    setPassword("");
    setConfirmPassword("");
    setFoundMember(null);
    setAuthError("");
    setView("home");
  };

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

  // Navigation items — includes Post Quiz
  const NAV_ITEMS = [
    { icon: "🏠", key: "home", label: "Home" },
    { icon: "🎯", key: "attend", label: "Attend Quiz" },
    { icon: "📖", key: "archive", label: "Solutions" },
    { icon: "➕", key: "post", label: "Post Quiz" },
    { icon: "🏆", key: "ranking", label: "Rankings" },
    ...(ADMIN_IDS.includes(user?.id)
      ? [{ icon: "📈", key: "admin", label: "Lead Hub" }]
      : []),
  ];

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

      <div style={{ background: "var(--navy)", minHeight: "100vh" }}>
        {/* ── HEADER ── */}
        <header
          style={{
            background: "var(--panel)",
            borderBottom: "1px solid var(--border)",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 100,
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
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Emerson_Electric_Company.svg/3840px-Emerson_Electric_Company.svg.png"
                  style={{
                    height: 28,
                    filter: "brightness(0) invert(1)",
                    opacity: 0.7,
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

            {/* ── TOP NAVIGATION BAR (only when logged in) ── */}
            {user && (
              <div
                style={{
                  display: "flex",
                  borderTop: "1px solid var(--border)",
                  paddingBottom: 0,
                }}
              >
                {NAV_ITEMS.map((n) => (
                  <button
                    key={n.key}
                    className={`top-nav-btn${view === n.key ? " active" : ""}`}
                    onClick={() => {
                      setActiveQuiz(null);
                      setArchiveQuiz(null);
                      setView(n.key);
                    }}
                    style={{ opacity: view === n.key ? 1 : 0.45 }}
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
                    {/* Hover tooltip */}
                    <span className="nav-tooltip">{n.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div
          style={{ maxWidth: 800, margin: "auto", padding: "24px 20px 60px" }}
        >
          {/* ── LOGIN ── */}
          {!user && (
            <div
              className="fadeIn"
              style={{
                display: "flex",
                gap: 24,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  flex: "1 1 360px",
                  borderRadius: 20,
                  overflow: "hidden",
                  height: 520,
                  position: "relative",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src="https://i.pinimg.com/736x/af/b3/fc/afb3fc03fbdb8b173a7f9fc1d6f743ec.jpg"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.85,
                  }}
                  alt="Engineering"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, var(--navy) 0%, transparent 60%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    right: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--teal)",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontFamily: "'DM Mono',monospace",
                      marginBottom: 8,
                    }}
                  >
                    NPD Division
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      lineHeight: 2,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    Team Portal
                  </div>
                </div>
              </div>

              <div style={{ flex: "1 1 220px" }}>
                <div
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: 28,
                    marginBottom: 16,
                  }}
                >
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
                          marginBottom: 14,
                        }}
                      >
                        Enter your password
                      </div>
                      <input
                        className={`field${authError ? " error" : ""}`}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setAuthError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                        onClick={handleLogin}
                        disabled={authLoading || !password}
                      >
                        {authLoading ? "Signing in..." : "Sign In"}
                      </button>
                    </div>
                  )}
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
                          marginBottom: 14,
                        }}
                      >
                        Create your account password
                      </div>
                      <input
                        className="field"
                        type="password"
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPwErrors([]);
                          setAuthError("");
                        }}
                      />
                      {password && (
                        <div
                          style={{
                            background: "var(--navy3)",
                            borderRadius: 10,
                            padding: "10px 14px",
                            marginBottom: 12,
                            marginTop: -8,
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
                      <input
                        className={`field${authError ? " error" : ""}`}
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setAuthError("");
                        }}
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
                        onClick={handleCreatePassword}
                        disabled={authLoading || !password || !confirmPassword}
                      >
                        {authLoading ? "Creating..." : "Create Account"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── LOGGED IN ── */}
          {user && (
            <div className="fadeIn">
              {/* User strip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  marginBottom: 20,
                }}
              >
                <Avatar name={user.name} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {user.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-faint)",
                      fontFamily: "'DM Mono',monospace",
                      marginTop: 2,
                    }}
                  >
                    {user.id}
                  </div>
                </div>
                <StatChip label="Tests" value={myResults.length} />
                <StatChip
                  label="Points"
                  value={myScore}
                  accent="var(--amber)"
                />
              </div>

              {/* ── HOME ── */}
              {view === "home" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
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
                      className="card-hover"
                      onClick={() => setView(c.target)}
                      style={{
                        background: "var(--panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 18,
                        padding: "22px 20px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 10 }}>
                        {c.icon}
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                      >
                        {c.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                        {c.sub}
                      </div>
                      <div
                        style={{
                          marginTop: 14,
                          height: 2,
                          width: 32,
                          background: c.accent,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  ))}
                  {ADMIN_IDS.includes(user.id) && (
                    <div
                      className="card-hover"
                      onClick={() => setView("admin")}
                      style={{
                        background: "var(--panel)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: 18,
                        padding: "22px 20px",
                        cursor: "pointer",
                        gridColumn: "1 / -1",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ fontSize: 28 }}>📈</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            Lead Hub — Audits
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-faint)",
                              marginTop: 2,
                            }}
                          >
                            Team performance management
                          </div>
                        </div>
                        <div
                          style={{
                            marginLeft: "auto",
                            fontSize: 10,
                            color: "var(--red)",
                            letterSpacing: "0.1em",
                            fontFamily: "'DM Mono',monospace",
                            border: "1px solid rgba(239,68,68,0.3)",
                            padding: "4px 10px",
                            borderRadius: 20,
                          }}
                        >
                          ADMIN
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── ATTEND ── */}
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
                  {quizzes.map((q) => {
                    const done = results.some(
                      (r) => r.userId === user.id && r.quizId === q.id
                    );
                    return (
                      <div
                        key={q.id}
                        style={{
                          background: "var(--panel)",
                          border: "1px solid var(--border)",
                          borderRadius: 16,
                          padding: "18px 20px",
                          marginBottom: 12,
                          opacity: done ? 0.55 : 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--text-faint)",
                              fontFamily: "'DM Mono',monospace",
                            }}
                          >
                            {q.author || "Lead"}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--red)",
                              fontFamily: "'DM Mono',monospace",
                            }}
                          >
                            ⏱ {q.deadline || "No Limit"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            marginBottom: 14,
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
                          {!done ? (
                            <button
                              className="btn-ghost"
                              onClick={() => startQuiz(q)}
                            >
                              START →
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--green)",
                                fontWeight: 700,
                              }}
                            >
                              COMPLETED ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── ACTIVE QUIZ ── */}
              {activeQuiz && (
                <div
                  className="fadeIn"
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

                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                        {Object.keys(userAnswers).length}/
                        {activeQuiz.questions.length} answered
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
                                  strikes >= n ? "var(--red)" : "var(--navy3)",
                                border: `1px solid ${
                                  strikes >= n ? "var(--red)" : "var(--border)"
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
                    <div
                      style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}
                    >
                      {activeQuiz.title}
                    </div>
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
                            (Object.keys(userAnswers).length /
                              activeQuiz.questions.length) *
                            100
                          }%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {activeQuiz.questions.map((q, i) => (
                    <div
                      key={i}
                      className="no-select"
                      style={{
                        background: "var(--panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 18,
                        padding: 20,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-faint)",
                          fontFamily: "'DM Mono',monospace",
                          marginBottom: 10,
                        }}
                      >
                        Q{String(i + 1).padStart(2, "0")}
                      </div>
                      {q.image && (
                        <img
                          src={q.image}
                          style={{
                            width: "100%",
                            borderRadius: 10,
                            marginBottom: 14,
                          }}
                          alt="Visual"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      )}
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        {q.text}
                      </p>
                      {q.options ? (
                        q.options.map((opt, idx) => (
                          <button
                            key={idx}
                            className={`option-btn${
                              userAnswers[i] === opt ? " selected" : ""
                            }`}
                            onClick={() =>
                              setUserAnswers({ ...userAnswers, [i]: opt })
                            }
                          >
                            <span
                              style={{
                                fontFamily: "'DM Mono',monospace",
                                fontSize: 11,
                                marginRight: 10,
                                opacity: 0.5,
                              }}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            {opt}
                          </button>
                        ))
                      ) : (
                        <input
                          className="field"
                          style={{ marginBottom: 0 }}
                          placeholder="Type your answer..."
                          onChange={(e) =>
                            setUserAnswers({
                              ...userAnswers,
                              [i]: e.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                  <button className="btn-primary" onClick={submitTest}>
                    Submit Final Answers
                  </button>
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
                  {quizzes.map((q) => {
                    const hasTaken = results.some(
                      (r) => r.userId === user.id && r.quizId === q.id
                    );
                    return (
                      <div
                        key={q.id}
                        className={hasTaken ? "card-hover" : ""}
                        style={{
                          background: "var(--panel)",
                          border: "1px solid var(--border)",
                          borderRadius: 16,
                          padding: "16px 20px",
                          marginBottom: 12,
                          opacity: hasTaken ? 1 : 0.4,
                          cursor: hasTaken ? "pointer" : "default",
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
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {q.title}
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'DM Mono',monospace",
                              letterSpacing: "0.07em",
                              color: hasTaken
                                ? "var(--green)"
                                : "var(--text-faint)",
                            }}
                          >
                            {hasTaken ? "UNLOCKED" : "LOCKED"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── ARCHIVE DETAIL ── */}
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
                      style={{
                        background: "var(--panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 16,
                        padding: "18px 20px",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-faint)",
                          fontFamily: "'DM Mono',monospace",
                          marginBottom: 8,
                        }}
                      >
                        Q{String(i + 1).padStart(2, "0")}
                      </div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        {q.text}
                      </p>
                      <div
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--green)",
                        }}
                      >
                        ✓ {q.correct}
                      </div>
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

                  {/* Quiz meta */}
                  <div
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 18,
                      padding: 24,
                      marginBottom: 16,
                    }}
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
                    <div style={{ position: "relative", marginBottom: 0 }}>
                      <input
                        type="date"
                        className="field"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        style={{
                          marginBottom: 0,
                          paddingRight: 44,
                          colorScheme: "dark",
                          color: deadline ? "#fff" : "var(--text-faint)",
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

                    {/* Type selector — only MCQ and Fill-Blank */}
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

                    {/* Question text */}
                    <textarea
                      className="field"
                      placeholder="Question text..."
                      value={qText}
                      rows={3}
                      onChange={(e) => setQText(e.target.value)}
                      style={{ resize: "vertical" }}
                    />

                    {/* Image upload — available for both types */}
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

                    {/* MCQ Options */}
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
                              gap: 10,
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

                    {/* Fill-Blank answer */}
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

                  {/* Draft preview button */}
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
                    style={{ background: "var(--green)" }}
                    onClick={publishQuiz}
                  >
                    Publish Quiz
                  </button>
                </div>
              )}

              {/* ── RANKING ── */}
              {view === "ranking" && (
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
                  <div
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 18,
                      overflow: "hidden",
                      marginBottom: 24,
                    }}
                  >
                    {TEAM_MEMBERS.map((m) => ({
                      ...m,
                      p: results
                        .filter((r) => r.userId === m.id)
                        .reduce((s, c) => s + (c.score || 0), 0),
                    }))
                      .sort((a, b) => b.p - a.p)
                      .map((p, i) => {
                        const medal =
                          i === 0
                            ? "🥇"
                            : i === 1
                            ? "🥈"
                            : i === 2
                            ? "🥉"
                            : null;
                        const isMe = p.id === user.id;
                        return (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              padding: "14px 20px",
                              background: isMe
                                ? "rgba(0,212,184,0.06)"
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
                              {medal || `${i + 1}`}
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
                                color: i < 3 ? "var(--amber)" : "var(--text)",
                              }}
                            >
                              {p.p}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}
                  >
                    My History
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
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
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
                              🚩
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
                          style={{ fontSize: 12, color: "var(--text-faint)" }}
                        >
                          /{res.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── ADMIN ── */}
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
                        style={{
                          background: "var(--panel)",
                          border: "1px solid var(--border)",
                          borderRadius: 14,
                          padding: "14px 18px",
                          marginBottom: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Avatar name={m.name} size={36} />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
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
                                  background: "rgba(239,68,68,0.15)",
                                  color: "var(--red)",
                                  border: "1px solid rgba(239,68,68,0.3)",
                                  padding: "1px 6px",
                                  borderRadius: 10,
                                  fontFamily: "'DM Mono',monospace",
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
                              fontSize: 11,
                              color: "var(--text-faint)",
                              fontFamily: "'DM Mono',monospace",
                              marginTop: 2,
                            }}
                          >
                            {count} tests · {pts} pts
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn-ghost"
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
                              background: "none",
                              border: "1px solid rgba(239,68,68,0.4)",
                              color: "var(--red)",
                              padding: "8px 12px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              letterSpacing: "0.04em",
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
