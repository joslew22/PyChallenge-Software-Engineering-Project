// src/pages/BuildChallenge.jsx
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";

export default function BuildChallenge() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([{ prompt: "", answer: "", hint: "" }]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { prompt: "", answer: "", hint: "" }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim() || questions.some((q) => !q.prompt.trim() || !q.answer.trim())) {
      setMessage("Please fill out a title and all questions/answers.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "challenges"), {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q) => ({
          prompt: q.prompt.trim(),
          answer: q.answer.trim(),
          hint: (q.hint || "").trim(),
        })),
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Challenge created! Check your Dashboard.");
      setTitle("");
      setDescription("");
      setQuestions([{ prompt: "", answer: "", hint: "" }]);
    } catch (err) {
      console.error("Error creating challenge:", err);
      setMessage("❌ Error creating challenge. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <main style={{ padding: "1rem", maxWidth: "700px", margin: "0 auto" }}>
        <h2>Build a New Challenge</h2>
        <p style={{ marginBottom: "1rem" }}>
          Use this page to define quizzes for your game.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label>
              Title
              <br />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label>
              Description (optional)
              <br />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </label>
          </div>

          <h3>Questions</h3>
          {questions.map((q, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <label>
                  Prompt
                  <br />
                  <input
                    type="text"
                    value={q.prompt}
                    onChange={(e) =>
                      handleQuestionChange(index, "prompt", e.target.value)
                    }
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </label>
              </div>
              <div>
                <label>
                  Correct Answer
                  <br />
                  <input
                    type="text"
                    value={q.answer}
                    onChange={(e) =>
                      handleQuestionChange(index, "answer", e.target.value)
                    }
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </label>
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <label>
                  Hint (optional)
                  <br />
                  <input
                    type="text"
                    value={q.hint || ""}
                    onChange={(e) =>
                      handleQuestionChange(index, "hint", e.target.value)
                    }
                    placeholder="Short hint to help players"
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.3rem 0.7rem",
                  borderRadius: "0.4rem",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "0.4rem",
              border: "1px solid #ccc",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            + Add Question
          </button>
          <br />

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.6rem 1.3rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Challenge"}
          </button>

          {message && (
            <p style={{ marginTop: "0.75rem", color: "#444" }}>{message}</p>
          )}
        </form>
      </main>
    </>
  );
}

