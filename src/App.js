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

const TEAM_MEMBERS = [
  { id: "VK001", name: "Vasanthakumar" },
  { id: "MP002", name: "Mugilan" },
  { id: "CU003", name: "Cibi" },
  { id: "MK004", name: "Moulish Kumar" },
  { id: "RR005", name: "Rahul" },
  { id: "EL006", name: "Elamparithi" },
  { id: "GR007", name: "Goutham" },
  { id: "SR008", name: "SriRagahvendar" },
  { id: "TS009", name: "Sarath" },
  { id: "VS010", name: "Velraj" },
  { id: "PM011", name: "Prasath" },
  { id: "HR012", name: "Heyram" },
  { id: "HN013", name: "Hemandh" },
  { id: "SD014", name: "Sridhar" },
  { id: "KK015", name: "Kumara Kannan" },
  { id: "KD016", name: "Kesavan" },
  { id: "VM019", name: "Vignesh" },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0a0f1e;
    --navy3: #1a2235;
    --panel: #161d2e;
    --teal: #00d4b8;
    --teal2: #00b89e;
    --teal-dim: rgba(0,212,184,0.12);
    --teal-glow: rgba(0,212,184,0.25);
    --amber: #f59e0b;
    --red: #ef4444;
    --green: #22c55e;
    --text: #e2e8f0;
    --text-dim: #94a3b8;
    --text-faint: #475569;
    --border: rgba(255,255,255,0.07);
    --border-teal: rgba(0,212,184,0.3);
  }

  body { background: var(--navy); color: var(--text); font-family: 'Sora', sans-serif; }
  input, select, textarea, button { font-family: 'Sora', sans-serif; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--navy); }
  ::-webkit-scrollbar-thumb { background: var(--teal-glow); border-radius: 2px; }

  .pulse { animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  .fadeIn { animation: fadeIn 0.35s ease forwards; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .card-hover { transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
  .card-hover:hover { transform: translateY(-2px); border-color: var(--border-teal) !important; box-shadow: 0 8px 32px rgba(0,212,184,0.1); }

  .btn-primary {
    width: 100%; padding: 14px 20px; background: var(--teal); color: var(--navy);
    border: none; border-radius: 10px; font-weight: 700; font-size: 14px;
    letter-spacing: 0.04em; cursor: pointer; transition: background 0.2s, transform 0.15s;
    text-transform: uppercase;
  }
  .btn-primary:hover { background: var(--teal2); transform: translateY(-1px); }

  .btn-ghost {
    background: none; border: 1px solid var(--border-teal); color: var(--teal);
    padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;
    cursor: pointer; letter-spacing: 0.05em; transition: background 0.2s;
  }
  .btn-ghost:hover { background: var(--teal-dim); }

  .field {
    width: 100%; background: var(--navy3); border: 1px solid var(--border);
    color: var(--text); padding: 13px 16px; border-radius: 10px; font-size: 14px;
    margin-bottom: 12px; outline: none; transition: border-color 0.2s;
  }
  .field:focus { border-color: var(--border-teal); }
  .field::placeholder { color: var(--text-faint); }

  .option-btn {
    width: 100%; padding: 13px 16px; margin-bottom: 8px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--navy3); color: var(--text);
    text-align: left; cursor: pointer; font-size: 14px; font-family: 'Sora', sans-serif;
    transition: border-color 0.2s, background 0.2s;
  }
  .option-btn:hover { border-color: var(--border-teal); background: var(--teal-dim); }
  .option-btn.selected { border-color: var(--teal); background: var(--teal-dim); color: var(--teal); font-weight: 600; }
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
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}

function CategoryBadge({ cat }) {
  const map = {
    Mechanical: ["#f59e0b", "#2a1f05"],
    Material: ["#a78bfa", "#1e1635"],
    Fluid: ["#60a5fa", "#0f1f35"],
  };
  const [fg, bg] = map[cat] || ["#94a3b8", "#1e2235"];
  return (
    <span
      style={{
        background: bg,
        color: fg,
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        border: `1px solid ${fg}44`,
      }}
    >
      {cat}
    </span>
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
          fontFamily: "'DM Mono', monospace",
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

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [archiveQuiz, setArchiveQuiz] = useState(null);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [category, setCategory] = useState("Mechanical");
  const [deadline, setDeadline] = useState("");
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [qType, setQType] = useState("MCQ");
  const [qText, setQText] = useState("");
  const [qImgUrl, setQImgUrl] = useState("");
  const [mcqOptions, setMcqOptions] = useState(["", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [ansKey, setAnsKey] = useState("");

  // Session persistence
  useEffect(() => {
    const checkSession = async () => {
      const savedId = localStorage.getItem("npd_portal_id");
      if (savedId) {
        try {
          const userDoc = await getDoc(doc(db, "users", savedId));
          if (userDoc.exists()) {
            setUser({ id: savedId, ...userDoc.data() });
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

  // Data sync
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const qSnap = await getDocs(
          query(collection(db, "quizzes"), orderBy("createdAt", "desc"))
        );
        const rSnap = await getDocs(
          query(collection(db, "results"), orderBy("submittedAt", "desc"))
        );
        setQuizzes(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setResults(rSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      };
      fetchData();
    }
  }, [user, view, activeQuiz]);

  const handleAuth = async () => {
    const id = authCode.toUpperCase();
    const member = TEAM_MEMBERS.find((m) => m.id === id);
    if (!member) return alert("ID not recognized");
    const snap = await getDoc(doc(db, "users", id));
    if (!snap.exists()) {
      setUser({ id, name: member.name });
      setIsFirstLogin(true);
    } else {
      const data = snap.data();
      if (data.password === password) {
        setUser({ id, ...data });
        localStorage.setItem("npd_portal_id", id);
        setView("home");
      } else {
        alert("Incorrect Password");
      }
    }
  };

  const finalizeSetup = async () => {
    if (password.length < 4) return alert("Min 4 characters");
    const profile = {
      name: user.name,
      password,
      role: user.id === "MK004" ? "admin" : "user",
    };
    await setDoc(doc(db, "users", user.id), profile);
    localStorage.setItem("npd_portal_id", user.id);
    setUser({ id: user.id, ...profile });
    setIsFirstLogin(false);
    setView("home");
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
    });
    alert(`Final Marks: ${score} / ${activeQuiz.questions.length}`);
    setActiveQuiz(null);
    setUserAnswers({});
    setView("home");
  };

  const publishQuiz = async () => {
    if (!newQuizTitle.trim()) return alert("Enter a quiz title");
    if (addedQuestions.length === 0) return alert("Add at least one question");
    await addDoc(collection(db, "quizzes"), {
      title: newQuizTitle,
      questions: addedQuestions,
      author: user.name,
      category,
      deadline,
      createdAt: new Date(),
    });
    alert("Quiz published!");
    setView("home");
    setAddedQuestions([]);
    setNewQuizTitle("");
  };

  const logout = () => {
    localStorage.removeItem("npd_portal_id");
    setUser(null);
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
                fontFamily: "'DM Mono', monospace",
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

  return (
    <>
      <style>{STYLES}</style>
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
          <div
            style={{
              maxWidth: 800,
              margin: "auto",
              display: "flex",
              alignItems: "center",
              height: 60,
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
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                CTC PORTAL
              </span>
            </div>
            <span
              style={{
                fontSize: 13,
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
                  height: 18,
                  filter: "brightness(0) invert(1)",
                  opacity: 0.7,
                }}
                alt="Emerson"
              />
              {user && !isFirstLogin && (
                <button className="btn-ghost" onClick={logout}>
                  LOGOUT
                </button>
              )}
            </div>
          </div>
        </header>

        <div
          style={{ maxWidth: 800, margin: "auto", padding: "24px 20px 100px" }}
        >
          {/* ── AUTH ── */}
          {(!user || isFirstLogin) && (
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
                  flex: "1 1 280px",
                  borderRadius: 20,
                  overflow: "hidden",
                  height: 480,
                  position: "relative",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src="https://i.pinimg.com/736x/66/60/8a/66608af3f7f00a5c1e6f24a8d8fd7911.jpg"
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
                      fontFamily: "'DM Mono', monospace",
                      marginBottom: 8,
                    }}
                  >
                    NPD Division
                  </div>
                  <div
                    style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}
                  >
                    Innovation
                    <br />
                    Management
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: "1 1 240px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "var(--teal)",
                      textTransform: "uppercase",
                      fontFamily: "'DM Mono', monospace",
                      marginBottom: 18,
                    }}
                  >
                    {isFirstLogin ? "— Set Password" : "— Portal Access"}
                  </div>
                  {!isFirstLogin && (
                    <input
                      className="field"
                      placeholder="Team ID (e.g. MK004)"
                      onChange={(e) => setAuthCode(e.target.value)}
                    />
                  )}
                  <input
                    className="field"
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="btn-primary"
                    onClick={isFirstLogin ? finalizeSetup : handleAuth}
                  >
                    {isFirstLogin ? "Activate Account" : "Enter Portal"}
                  </button>
                </div>
                {[
                  {
                    title: "Echo-24 Prototype",
                    body: "Evaluation session scheduled for Q2.",
                  },
                  {
                    title: "Compliance Update",
                    body: "New Material Compliance Guidelines live.",
                  },
                  {
                    title: "ISO 9001 Achieved",
                    body: "Lab Recertification milestone confirmed.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      padding: "16px 20px",
                    }}
                  >
                    <div
                      style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LOGGED IN ── */}
          {user && !isFirstLogin && (
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
                      fontFamily: "'DM Mono', monospace",
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
                  {user.id === "MK004" && (
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
                            Full team performance overview
                          </div>
                        </div>
                        <div
                          style={{
                            marginLeft: "auto",
                            fontSize: 10,
                            color: "var(--red)",
                            letterSpacing: "0.1em",
                            fontFamily: "'DM Mono', monospace",
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
                        fontFamily: "'DM Mono', monospace",
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
                            alignItems: "flex-start",
                            marginBottom: 12,
                          }}
                        >
                          <CategoryBadge cat={q.category} />
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--text-faint)",
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {q.author || "Lead"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            marginBottom: 10,
                          }}
                        >
                          {q.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--red)",
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            ⏱ {q.deadline || "No Limit"}
                          </span>
                          {!done ? (
                            <button
                              className="btn-ghost"
                              onClick={() => setActiveQuiz(q)}
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
                <div className="fadeIn">
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--teal)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {Object.keys(userAnswers).length}/
                      {activeQuiz.questions.length} answered
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
                          fontFamily: "'DM Mono', monospace",
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
                                fontFamily: "'DM Mono', monospace",
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
                        fontFamily: "'DM Mono', monospace",
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
                    const hasTaken =
                      results.some(
                        (r) => r.userId === user.id && r.quizId === q.id
                      ) || user.id === "MK004";
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
                              fontFamily: "'DM Mono', monospace",
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
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--teal)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      marginBottom: 16,
                      padding: 0,
                    }}
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
                          fontFamily: "'DM Mono', monospace",
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
                        fontFamily: "'DM Mono', monospace",
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
                    <div style={{ display: "flex", gap: 10 }}>
                      <select
                        className="field"
                        style={{ flex: 1, marginBottom: 0 }}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option>Mechanical</option>
                        <option>Material</option>
                        <option>Fluid</option>
                      </select>
                      <input
                        type="date"
                        className="field"
                        style={{ flex: 1, marginBottom: 0 }}
                        onChange={(e) => setDeadline(e.target.value)}
                      />
                    </div>
                  </div>
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
                        fontFamily: "'DM Mono', monospace",
                        marginBottom: 14,
                      }}
                    >
                      Question Type
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      {["MCQ", "Fill-Blank", "Picture"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setQType(t)}
                          style={{
                            padding: "8px 14px",
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
                          }}
                        >
                          {t}
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
                    {qType === "MCQ" ? (
                      <div>
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
                              style={{ accentColor: "var(--teal)" }}
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
                          }}
                          onClick={() => setMcqOptions([...mcqOptions, ""])}
                        >
                          + Add Option
                        </button>
                      </div>
                    ) : (
                      <input
                        className="field"
                        placeholder="Correct Answer"
                        value={ansKey}
                        onChange={(e) => setAnsKey(e.target.value)}
                      />
                    )}
                    {qType === "Picture" && (
                      <input
                        className="field"
                        placeholder="Image URL"
                        value={qImgUrl}
                        onChange={(e) => setQImgUrl(e.target.value)}
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
                        marginTop: 12,
                      }}
                      onClick={() => {
                        if (!qText.trim()) return alert("Enter a question");
                        setAddedQuestions([
                          ...addedQuestions,
                          {
                            type: qType,
                            text: qText,
                            image: qType === "Picture" ? qImgUrl : null,
                            options: qType === "MCQ" ? [...mcqOptions] : null,
                            correct:
                              qType === "MCQ" ? mcqOptions[correctIdx] : ansKey,
                          },
                        ]);
                        setQText("");
                        setAnsKey("");
                        alert("Question added!");
                      }}
                    >
                      + Add Question ({addedQuestions.length} added)
                    </button>
                  </div>
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
                        fontFamily: "'DM Mono', monospace",
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
                                fontFamily: "'DM Mono', monospace",
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
                                fontFamily: "'DM Mono', monospace",
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
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {res.quizTitle}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-faint)",
                            fontFamily: "'DM Mono', monospace",
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
                          fontFamily: "'DM Mono', monospace",
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
              {view === "admin" && user.id === "MK004" && (
                <div className="fadeIn">
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--red)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      Admin
                    </div>
                    <div
                      style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}
                    >
                      Lead Hub — Audits
                    </div>
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
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {m.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-faint)",
                              fontFamily: "'DM Mono', monospace",
                              marginTop: 2,
                            }}
                          >
                            {count} tests · {pts} pts
                          </div>
                        </div>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        {user && !isFirstLogin && (
          <nav
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 800,
              background: "var(--panel)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              zIndex: 100,
            }}
          >
            {[
              { icon: "🏠", key: "home" },
              { icon: "🎯", key: "attend" },
              { icon: "📖", key: "archive" },
              { icon: "🏆", key: "ranking" },
            ].map((n) => (
              <button
                key={n.key}
                onClick={() => {
                  setActiveQuiz(null);
                  setArchiveQuiz(null);
                  setView(n.key);
                }}
                style={{
                  flex: 1,
                  border: "none",
                  background: "none",
                  padding: "14px 0",
                  fontSize: 22,
                  cursor: "pointer",
                  opacity: view === n.key ? 1 : 0.35,
                  borderTop:
                    view === n.key
                      ? "2px solid var(--teal)"
                      : "2px solid transparent",
                  transition: "opacity 0.2s, border-color 0.2s",
                }}
              >
                {n.icon}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
