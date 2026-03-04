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
} from "firebase/firestore";

// --- 1. PASTE YOUR KEYS HERE (Keep your existing config) ---
// --- PASTE YOUR KEYS HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyBpJAQpN0A9UObf5g_MpCWApezd3EsLBrs",
  authDomain: "quiz-portal-test1.firebaseapp.com",
  projectId: "quiz-portal-test1",
  storageBucket: "quiz-portal-test1.firebasestorage.app",
  messagingSenderId: "310358908079",
  appId: "1:310358908079:web:2ea1109ecfa3473037885a",
  measurementId: "G-99J56XZ7WM",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- KEEP EVERYTHING ABOVE THIS LINE (IMPORTS & CONFIG) AS IS ---

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

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);

  // Auth & Session
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Global States
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [archiveQuiz, setArchiveQuiz] = useState(null);

  // Builder Logic States
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

  // 1. Session persistence
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

  // 2. Data Sync
  useEffect(() => {
    if (user && view !== "login") {
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

  // 3. Auth Actions
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

  // 4. Test Submission
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

  if (loading) return <div style={ui.centered}>Synchronizing Systems...</div>;

  return (
    <div style={ui.app}>
      <header style={ui.mainHeader}>
        <div style={ui.headerTop}>
          <div style={{ flex: 1 }}></div>
          <h3 style={ui.headerCenterTitle}>Chennai Technology Center</h3>
          <div style={{ flex: 1, textAlign: "right" }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Emerson_Electric_Company.svg/3840px-Emerson_Electric_Company.svg.png"
              style={ui.emersonLogoMain}
              alt="Emerson"
            />
          </div>
        </div>
        {user && !isFirstLogin && (
          <div style={ui.headerBottom}>
            <div style={ui.userInfo}>
              <div style={ui.userName}>{user.name}</div>
              <div style={ui.userId}>{user.id}</div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("npd_portal_id");
                setUser(null);
              }}
              style={ui.logoutBtn}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <div style={ui.contentWrapper}>
        {!user || isFirstLogin ? (
          <div style={ui.wideEntryLayout}>
            <div style={ui.entryColumnImage}>
              <img
                src="https://i.pinimg.com/736x/66/60/8a/66608af3f7f00a5c1e6f24a8d8fd7911.jpg"
                style={ui.largeImg}
                alt="Engineering"
              />
              <div style={ui.imageOverlay}>Innovation Management</div>
            </div>
            <div style={ui.entryColumnForm}>
              <div style={ui.loginCard}>
                <h3>
                  {isFirstLogin ? "Set System Password" : "NPD Portal Access"}
                </h3>
                {!isFirstLogin && (
                  <input
                    style={ui.input}
                    placeholder="Team ID (e.g. MK004)"
                    onChange={(e) => setAuthCode(e.target.value)}
                  />
                )}
                <input
                  style={ui.input}
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  style={ui.btn}
                  onClick={isFirstLogin ? finalizeSetup : handleAuth}
                >
                  Enter Portal
                </button>
              </div>
            </div>
            <div style={ui.entryColumnInfo}>
              <div style={ui.infoCard}>
                <b>Chennai Updates</b>
                <p>Echo-24 Prototype Evaluation scheduled.</p>
              </div>
              <div style={ui.infoCard}>
                <b>Announcements</b>
                <p>New Material Compliance Guidelines live.</p>
              </div>
              <div style={ui.infoCard}>
                <b>Milestones</b>
                <p>Lab Recertification achieved: ISO 9001.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={ui.appContainer}>
            {view === "home" && (
              <div>
                <div style={ui.card} onClick={() => setView("attend")}>
                  🎯 Attend Quiz
                </div>
                <div
                  style={{ ...ui.card, borderColor: "#ffc107" }}
                  onClick={() => setView("archive")}
                >
                  📖 Gated Solutions
                </div>
                <div
                  style={{ ...ui.card, borderColor: "#58cc02" }}
                  onClick={() => setView("post")}
                >
                  ➕ Post New Quiz
                </div>
                {user.id === "MK004" && (
                  <div
                    style={{ ...ui.card, background: "#333", color: "#fff" }}
                    onClick={() => setView("admin")}
                  >
                    📈 LEAD HUB (AUDITS)
                  </div>
                )}
              </div>
            )}

            {view === "attend" && !activeQuiz && (
              <div>
                <h3>Active Tests</h3>
                {quizzes.map((q) => {
                  const done = results.some(
                    (r) => r.userId === user.id && r.quizId === q.id
                  );
                  return (
                    <div
                      key={q.id}
                      style={{ ...ui.listItem, opacity: done ? 0.6 : 1 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={ui.tag}>{q.category}</span>
                        <small style={{ fontSize: 10, color: "#888" }}>
                          Posted by: {q.author || "Lead"}
                        </small>
                      </div>
                      <div style={{ margin: "10px 0" }}>
                        <b>{q.title}</b>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <small style={{ color: "#ff4d4d", fontWeight: "bold" }}>
                          Deadline: {q.deadline || "No Limit"}
                        </small>
                        {!done ? (
                          <button
                            style={ui.smallBtn}
                            onClick={() => setActiveQuiz(q)}
                          >
                            Start
                          </button>
                        ) : (
                          <span
                            style={{
                              color: "#58cc02",
                              fontSize: 11,
                              fontWeight: "bold",
                            }}
                          >
                            DONE ✅
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeQuiz && (
              <div>
                <h3>{activeQuiz.title}</h3>
                {activeQuiz.questions.map((q, i) => (
                  <div key={i} style={ui.qBox}>
                    {q.image && (
                      <img
                        src={q.image}
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          marginBottom: 10,
                        }}
                        alt="Visual"
                      />
                    )}
                    <p>
                      <b>
                        {i + 1}. {q.text}
                      </b>
                    </p>
                    {q.options ? (
                      q.options.map((opt, idx) => (
                        <button
                          key={idx}
                          style={{
                            ...ui.opt,
                            border:
                              userAnswers[i] === opt
                                ? "2px solid #1cb0f6"
                                : "1px solid #ddd",
                          }}
                          onClick={() =>
                            setUserAnswers({ ...userAnswers, [i]: opt })
                          }
                        >
                          {opt}
                        </button>
                      ))
                    ) : (
                      <input
                        style={ui.input}
                        placeholder="Type answer..."
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
                <button style={ui.btn} onClick={submitTest}>
                  Final Submission
                </button>
              </div>
            )}

            {view === "archive" && !archiveQuiz && (
              <div>
                <h3>Gated Solutions Archive</h3>
                {quizzes.map((q) => {
                  const hasTaken =
                    results.some(
                      (r) => r.userId === user.id && r.quizId === q.id
                    ) || user.id === "MK004";
                  return (
                    <div
                      key={q.id}
                      style={{ ...ui.listItem, opacity: hasTaken ? 1 : 0.4 }}
                      onClick={() =>
                        hasTaken
                          ? setArchiveQuiz(q)
                          : alert("Complete quiz first.")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <b>{q.title}</b>
                        <small>{hasTaken ? "🔓 Unlocked" : "🔒 Locked"}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {archiveQuiz && (
              <div>
                <button onClick={() => setArchiveQuiz(null)} style={ui.link}>
                  ← Back
                </button>
                <h3>{archiveQuiz.title} Keys</h3>
                {archiveQuiz.questions.map((q, i) => (
                  <div key={i} style={ui.qBox}>
                    <p>
                      <b>
                        Q{i + 1}: {q.text}
                      </b>
                    </p>
                    <div style={{ color: "#58cc02", fontWeight: "bold" }}>
                      Ans: {q.correct}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === "post" && (
              <div style={ui.builder}>
                <h3>Quiz Builder</h3>
                <input
                  style={ui.input}
                  placeholder="Quiz Title"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                />
                <div style={{ display: "flex", gap: 5 }}>
                  <select
                    style={{ ...ui.input, flex: 1 }}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Mechanical</option>
                    <option>Material</option>
                    <option>Fluid</option>
                  </select>
                  <input
                    type="date"
                    style={{ ...ui.input, flex: 1 }}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <div style={ui.qCreator}>
                  <div style={{ marginBottom: 10 }}>
                    {["MCQ", "Fill-Blank", "Picture"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setQType(t)}
                        style={{
                          ...ui.tab,
                          background: qType === t ? "#1cb0f6" : "#fff",
                          color: qType === t ? "#fff" : "#000",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <textarea
                    style={ui.input}
                    placeholder="Question..."
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                  />
                  {qType === "MCQ" ? (
                    <div>
                      {mcqOptions.map((o, i) => (
                        <div
                          key={i}
                          style={{ display: "flex", marginBottom: 5 }}
                        >
                          <input
                            type="radio"
                            checked={correctIdx === i}
                            onChange={() => setCorrectIdx(i)}
                          />
                          <input
                            style={{ ...ui.input, flex: 1, marginLeft: 10 }}
                            value={o}
                            onChange={(e) => {
                              let n = [...mcqOptions];
                              n[i] = e.target.value;
                              setMcqOptions(n);
                            }}
                            placeholder={`Option ${i + 1}`}
                          />
                        </div>
                      ))}
                      <button
                        style={ui.link}
                        onClick={() => setMcqOptions([...mcqOptions, ""])}
                      >
                        + Option
                      </button>
                    </div>
                  ) : (
                    <input
                      style={ui.input}
                      placeholder="Correct Answer"
                      value={ansKey}
                      onChange={(e) => setAnsKey(e.target.value)}
                    />
                  )}
                  {qType === "Picture" && (
                    <input
                      style={ui.input}
                      placeholder="Img URL"
                      value={qImgUrl}
                      onChange={(e) => setQImgUrl(e.target.value)}
                    />
                  )}
                  <button
                    style={{ ...ui.btn, background: "#333" }}
                    onClick={() => {
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
                      alert("Saved!");
                    }}
                  >
                    Add Question
                  </button>
                </div>
                <button
                  style={{ ...ui.btn, background: "#58cc02", marginTop: 10 }}
                  onClick={async () => {
                    await addDoc(collection(db, "quizzes"), {
                      title: newQuizTitle,
                      questions: addedQuestions,
                      author: user.name,
                      category,
                      deadline,
                      createdAt: new Date(),
                    });
                    alert("Published!");
                    setView("home");
                    setAddedQuestions([]);
                  }}
                >
                  Publish Quiz
                </button>
              </div>
            )}

            {view === "ranking" && (
              <div>
                <h3>Leaderboard</h3>
                <div style={ui.rankCard}>
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
                          : `${i + 1}.`;
                      return (
                        <div
                          key={p.id}
                          style={{
                            ...ui.rankRow,
                            background: p.id === user.id ? "#eef2ff" : "#fff",
                          }}
                        >
                          <span>
                            {medal} {p.name} {p.id === user.id && "(You)"}
                          </span>
                          <b>{p.p} Pts</b>
                        </div>
                      );
                    })}
                </div>

                <h4 style={{ marginTop: 30, marginBottom: 10 }}>
                  My Performance History
                </h4>
                {results
                  .filter((r) => r.userId === user.id)
                  .map((res, i) => (
                    <div key={i} style={ui.scoreBox}>
                      <div>
                        <b>{res.quizTitle}</b>
                        <br />
                        <small>
                          {new Date(
                            res.submittedAt.seconds * 1000
                          ).toLocaleDateString()}
                        </small>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <b>
                          {res.score}/{res.total}
                        </b>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {view === "admin" && user.id === "MK004" && (
              <div>
                <h3>Lead Hub Audits</h3>
                {TEAM_MEMBERS.map((m) => (
                  <div key={m.id} style={ui.adminRow}>
                    <span>
                      <b>{m.name}</b>
                      <br />
                      <small>
                        {results.filter((r) => r.userId === m.id).length} Tests
                      </small>
                    </span>
                    <button
                      style={ui.smallBtn}
                      onClick={() => {
                        const hist = results.filter((r) => r.userId === m.id);
                        let csv =
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {user && !isFirstLogin && (
        <nav style={ui.nav}>
          <button
            style={{
              ...ui.navItem,
              color: view === "home" ? "#1cb0f6" : "#999",
            }}
            onClick={() => setView("home")}
          >
            🏠
          </button>
          <button
            style={{
              ...ui.navItem,
              color: view === "ranking" ? "#1cb0f6" : "#999",
            }}
            onClick={() => setView("ranking")}
          >
            🏆
          </button>
        </nav>
      )}
    </div>
  );
}

const ui = {
  app: { background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  centered: { textAlign: "center", padding: "100px" },
  mainHeader: {
    background: "#fff",
    borderBottom: "1px solid #eee",
    padding: "15px 40px",
  },
  headerTop: { display: "flex", alignItems: "center", marginBottom: "10px" },
  headerCenterTitle: {
    fontSize: "18px",
    color: "#005596",
    margin: 0,
    fontWeight: "bold",
    flex: 2,
    textAlign: "center",
  },
  emersonLogoMain: { height: "22px" },
  headerBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    maxWidth: "1000px",
    margin: "auto",
  },
  userName: { fontSize: "18px", fontWeight: "bold" },
  userId: { fontSize: "12px", color: "#888" },
  logoutBtn: {
    border: "1px solid #ff4d4d",
    background: "none",
    color: "#ff4d4d",
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
  },
  contentWrapper: { padding: "40px 20px" },
  appContainer: { maxWidth: "480px", margin: "auto" },
  wideEntryLayout: {
    display: "flex",
    maxWidth: "1200px",
    margin: "auto",
    gap: "20px",
    alignItems: "flex-start",
  },
  entryColumnImage: {
    flex: 1.5,
    position: "relative",
    borderRadius: "25px",
    overflow: "hidden",
    height: "500px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  largeImg: { width: "100%", height: "100%", objectFit: "cover" },
  imageOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    color: "#fff",
    fontSize: "24px",
    fontWeight: "bold",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  entryColumnForm: { flex: 1 },
  loginCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "25px",
    border: "1px solid #eee",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },
  entryColumnInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  infoCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #eee",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "16px",
    borderRadius: "15px",
    background: "#1cb0f6",
    color: "#fff",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  card: {
    padding: "20px",
    borderRadius: "20px",
    background: "#fff",
    border: "1px solid #eee",
    marginBottom: "15px",
    textAlign: "center",
    fontWeight: "bold",
    cursor: "pointer",
  },
  listItem: {
    padding: "15px",
    background: "#fff",
    borderRadius: "15px",
    marginBottom: "12px",
    border: "1px solid #eee",
  },
  qBox: {
    padding: "20px",
    borderRadius: "25px",
    background: "#fff",
    border: "1px solid #eee",
    marginBottom: "15px",
  },
  opt: {
    width: "100%",
    padding: "12px",
    marginBottom: "8px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
    background: "#fff",
    cursor: "pointer",
  },
  nav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "480px",
    height: "70px",
    display: "flex",
    background: "#fff",
    borderTop: "1px solid #eee",
  },
  navItem: { flex: 1, border: "none", background: "none", fontSize: "24px" },
  tag: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "bold",
  },
  rankCard: {
    padding: 15,
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #eee",
  },
  rankRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    borderBottom: "1px solid #f0f0f0",
  },
  scoreBox: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    background: "#fff",
    borderRadius: 15,
    border: "1px solid #eee",
    marginBottom: 8,
  },
  adminRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    background: "#fff",
    borderRadius: 15,
    marginBottom: 8,
    border: "1px solid #eee",
    alignItems: "center",
  },
  smallBtn: {
    background: "#1cb0f6",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "10px",
    fontSize: 11,
    fontWeight: "bold",
  },
  tab: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginRight: 5,
    fontSize: 11,
    fontWeight: "bold",
  },
  builder: {
    background: "#fff",
    padding: 20,
    borderRadius: 20,
    border: "1px solid #eee",
  },
  qCreator: {
    background: "#f9f9f9",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  preview: {
    padding: 10,
    background: "#fff",
    border: "1px dashed #ccc",
    borderRadius: 10,
    margin: "10px 0",
  },
  link: {
    border: "none",
    background: "none",
    color: "#1cb0f6",
    fontSize: 12,
    fontWeight: "bold",
    display: "block",
    marginBottom: 10,
  },
};
