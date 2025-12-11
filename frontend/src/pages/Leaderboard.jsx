// src/pages/Leaderboard.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch all attempts from Firestore (no server-side ordering to avoid composite index requirement)
        const q = query(
          collection(db, "attempts"),
          limit(100)
        );
        const snap = await getDocs(q);
        
        if (snap.empty) {
          console.log("No attempts found in Firestore.");
          setEntries([]);
        } else {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          console.log(`Fetched ${items.length} attempts from Firestore:`, items);
          
          // Defensive client-side sort by score descending (handles missing/invalid scores gracefully)
          const sorted = items.sort((a, b) => {
            const scoreA = typeof a.score === 'number' ? a.score : 0;
            const scoreB = typeof b.score === 'number' ? b.score : 0;
            // Higher scores first
            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            }
            // Tie-break by most recent attempt
            const timeA = a.createdAt?.toMillis?.() ?? 0;
            const timeB = b.createdAt?.toMillis?.() ?? 0;
            return timeB - timeA;
          });
          
          console.log("Sorted leaderboard entries:", sorted);
          setEntries(sorted);
        }
      } catch (err) {
        console.error("Error loading leaderboard:", err);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main style={{ padding: "0 1.5rem" }}>
        <h2>Leaderboard</h2>
        {loading ? (
          <p>Loading...</p>
        ) : entries.length === 0 ? (
          <p>No attempts yet. Play a challenge to appear here.</p>
        ) : (
          <table
            style={{
              borderCollapse: "collapse",
              marginTop: "1rem",
              minWidth: "60%",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.4rem" }}>#</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.4rem" }}>Player</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.4rem" }}>Challenge</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.4rem" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, index) => (
                <tr key={e.id}>
                  <td style={{ padding: "0.4rem" }}>{index + 1}</td>
                  <td style={{ padding: "0.4rem" }}>{e.userName}</td>
                  <td style={{ padding: "0.4rem" }}>{e.challengeTitle}</td>
                  <td style={{ padding: "0.4rem" }}>
                    {e.score} / {e.totalQuestions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
  );
}
