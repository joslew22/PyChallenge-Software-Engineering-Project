// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "challenges"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setChallenges(items);
    } catch (err) {
      console.error("Error loading challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const myChallenges = challenges.filter((c) => c.createdBy === user.uid);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this challenge?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "challenges", id));
      setChallenges((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting challenge:", err);
      alert("Failed to delete challenge. Check console.");
    }
  };

  return (
    <>
      <main
        style={{
          padding: "0 1.5rem",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h2>Welcome to PyChallenge</h2>
        <p>
          Play curated Python quizzes, track your results, and climb the leaderboard.
        </p>

        {/* My Challenges */}
        <section style={{ marginTop: "1.5rem" }}>
          <h3>My Challenges</h3>
          {loading ? (
            <p>Loading...</p>
          ) : myChallenges.length === 0 ? (
            <p>
              You haven’t created any challenges yet. Use{" "}
              <strong>Build Challenge</strong> to add one.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {myChallenges.map((c) => (
                <li
                  key={c.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h4 style={{ marginBottom: "0.3rem" }}>{c.title}</h4>
                  {c.description && (
                    <p style={{ marginBottom: "0.3rem" }}>{c.description}</p>
                  )}
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>
                    Questions: {c.questions?.length || 0}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <Link to={`/play/${c.id}`}>
                      <button
                        style={{
                          padding: "0.35rem 0.8rem",
                          borderRadius: "0.4rem",
                          border: "1px solid #ccc",
                          cursor: "pointer",
                        }}
                      >
                        Play
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{
                        padding: "0.35rem 0.8rem",
                        borderRadius: "0.4rem",
                        border: "1px solid #f66",
                        color: "#a00",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* All Challenges */}
        <section style={{ marginTop: "2rem" }}>
          <h3>All Challenges</h3>
          {loading ? (
            <p>Loading...</p>
          ) : challenges.length === 0 ? (
            <p>
              No challenges yet. Use <strong>Build Challenge</strong> to create the
              first one.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {challenges.map((c) => (
                <li
                  key={c.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h4 style={{ marginBottom: "0.3rem" }}>{c.title}</h4>
                  {c.description && (
                    <p style={{ marginBottom: "0.3rem" }}>{c.description}</p>
                  )}
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>
                    Questions: {c.questions?.length || 0} · by{" "}
                    {c.createdByName || "Anonymous"}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <Link to={`/play/${c.id}`}>
                      <button
                        style={{
                          padding: "0.35rem 0.8rem",
                          borderRadius: "0.4rem",
                          border: "1px solid #ccc",
                          cursor: "pointer",
                        }}
                      >
                        Play
                      </button>
                    </Link>
                    {c.createdBy === user.uid && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{
                          padding: "0.35rem 0.8rem",
                          borderRadius: "0.4rem",
                          border: "1px solid #f66",
                          color: "#a00",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
