// src/pages/PlayChallenge.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";

export default function PlayChallenge() {
  const { id } = useParams();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showHints, setShowHints] = useState([]);
  const [hintRequests, setHintRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenge = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "challenges", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setChallenge({ id: snap.id, ...data });
          setAnswers(new Array(data.questions.length).fill(""));
            setShowHints(new Array(data.questions.length).fill(false));
            setHintRequests(new Array(data.questions.length).fill(0));
        } else {
          setChallenge(null);
        }
      } catch (err) {
        console.error("Error loading challenge:", err);
      } finally {
        setLoading(false);
      }
    };
    loadChallenge();
  }, [id]);

  const handleChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!challenge) return;

    let correct = 0;
    challenge.questions.forEach((q, i) => {
      const expected = q.answer.trim().toLowerCase();
      const given = (answers[i] || "").trim().toLowerCase();
      if (given === expected) correct += 1;
    });

    setScore(correct);
    setSubmitted(true);

    try {
      await addDoc(collection(db, "attempts"), {
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        userId: user.uid,
        userName: user.displayName || user.email,
        score: correct,
        totalQuestions: challenge.questions.length,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error saving attempt:", err);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: "0 1.5rem" }}>
        <p>Loading challenge...</p>
      </main>
    );
  }

  if (!challenge) {
    return (
      <main style={{ padding: "0 1.5rem" }}>
        <p>Challenge not found.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "0 1.5rem", maxWidth: "800px", margin: "0 auto" }}>
        <h2>{challenge.title}</h2>
        {challenge.description && <p>{challenge.description}</p>}

        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          {challenge.questions.map((q, index) => (
            <div
              key={index}
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #ddd",
              }}
            >
              <p style={{ fontWeight: "bold" }}>
                Question {index + 1}: {q.prompt}
              </p>
                  {/* Hint button - shown only when a hint exists for this question */}
                  {q.hint && q.hint.trim() !== "" && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() =>
                          setShowHints((prev) => {
                            const copy = [...prev];
                            copy[index] = !copy[index];
                            return copy;
                          })
                        }
                        style={{
                          padding: "0.25rem 0.6rem",
                          borderRadius: "0.4rem",
                          border: "1px solid #ccc",
                          cursor: "pointer",
                          marginBottom: "0.4rem",
                        }}
                      >
                        {showHints[index] ? "Hide Hint" : "Show Hint"}
                      </button>
                      {showHints[index] && (
                        <div style={{ marginTop: "0.25rem", color: "#333" }}>
                          <small style={{ display: "block", marginBottom: "0.25rem", color: "#666" }}>Hint used</small>
                          <div style={{ background: "#f8f8f8", padding: "0.5rem", borderRadius: "0.4rem" }}>{q.hint}</div>
                        </div>
                      )}
                    </div>
                  )}
              <input
                type="text"
                value={answers[index] || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                disabled={submitted}
                style={{ width: "100%", padding: "0.5rem" }}
              />
              {/* Progressive additional hints (reveal letters of the answer) */}
              <div style={{ marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    // Increase request count for this question, but do not reveal the full answer
                    setHintRequests((prev) => {
                      const copy = [...prev];
                      const maxReveal = Math.max(0, (q.answer || "").length - 1);
                      copy[index] = Math.min((copy[index] || 0) + 1, maxReveal);
                      return copy;
                    });
                    // Ensure hint panel is visible when requesting additional hints
                    setShowHints((prev) => {
                      const copy = [...prev];
                      copy[index] = true;
                      return copy;
                    });
                  }}
                  style={{
                    padding: "0.25rem 0.6rem",
                    borderRadius: "0.4rem",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    marginRight: "0.5rem",
                    marginTop: "0.25rem",
                  }}
                >
                  Request Hint
                </button>

                {/* Show a small display of the progressive hint (masked) */}
                {hintRequests[index] > 0 && (
                  <div style={{ marginTop: "0.5rem", color: "#444" }}>
                    <small style={{ color: "#666" }}>Additional hint:</small>
                    <div style={{ marginTop: "0.25rem", background: "#fbfbfb", padding: "0.4rem", borderRadius: "0.4rem" }}>
                      {(() => {
                        const answer = (q.answer || "").toString();
                        const reveal = hintRequests[index] || 0;
                        if (!answer) return <em style={{ color: "#777" }}>No extra hints available</em>;
                        // reveal first N chars, mask rest with •
                        const shown = answer.slice(0, reveal);
                        const masked = answer.slice(reveal).replace(/./g, '•');
                        return <span>{shown}{masked}</span>;
                      })()}
                    </div>
                  </div>
                )}
              </div>
              {submitted && showAnswers && (
                <p
                  style={{
                    marginTop: "0.3rem",
                    fontSize: "0.9rem",
                    color: "#555",
                  }}
                >
                  Correct answer: <strong>{q.answer}</strong>
                </p>
              )}
            </div>
          ))}

          {!submitted ? (
            <button
              type="submit"
              style={{
                padding: "0.6rem 1.3rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Submit Answers
            </button>
          ) : (
            <>
              <p style={{ marginTop: "0.75rem" }}>
                You got {score} / {challenge.questions.length} correct.
              </p>
              <button
                type="button"
                onClick={() => setShowAnswers((prev) => !prev)}
                style={{
                  marginTop: "0.4rem",
                  padding: "0.4rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                {showAnswers ? "Hide Answers" : "Reveal Answers"}
              </button>
            </>
          )}
        </form>
      </main>
  );
}
