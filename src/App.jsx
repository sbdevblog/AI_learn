import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const MODEL_MAP = {
  blog: "tiiuae/falcon-7b-instruct",
  code: "tiiuae/falcon-7b-instruct",
  docs: "google/flan-t5-base",
};

const App = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedMode, setSelectedMode] = useState("blog");
  const [loading, setLoading] = useState(false);

  const generateContent = async () => {
    const prompts = {
      blog: `Write a detailed blog post about: ${inputText}`,
      code: `Write code for the following requirement:\n${inputText}`,
      docs: `Write documentation for the following:\n${inputText}`,
    };

    try {
      setLoading(true);
      const model = MODEL_MAP[selectedMode];
      const response = await axios.post(
          `https://api-inference.huggingface.co/models/${model}`,
          { inputs: prompts[selectedMode] },
          {
            headers: {
              Authorization: `Bearer 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`,
            },
          }
      );

      setOutputText(response.data[0]?.generated_text || "No response");
    } catch (err) {
      setOutputText("⚠️ Error: Could not generate response.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="app-container">
        <h1 className="title">📝 AI Writer Pad</h1>

        <div className="mode-selector">
          <label htmlFor="mode">Choose Mode:</label>
          <select
              id="mode"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
          >
            <option value="blog">📖 Blog</option>
            <option value="code">💻 Code</option>
            <option value="docs">📄 Docs</option>
          </select>
        </div>

        <textarea
            rows="6"
            placeholder="Enter your topic or request..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
        />

        <button onClick={generateContent} disabled={loading}>
          {loading ? "Generating..." : "🚀 Generate"}
        </button>

        <div className="output-section">
          <h2>🧠 Output:</h2>
          <pre>{outputText}</pre>
        </div>
      </div>
  );
};

export default App;
