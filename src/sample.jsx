import React, { useState } from 'react';

const HF_API_TOKEN = "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";

const MODEL_MAP = {
    blog: "tiiuae/falcon-7b-instruct",
    code: "Salesforce/codegen-350M-mono",
    docs: "google/flan-t5-base",
};

export default function App() {

    const [task, setTask] = useState("blog");
    const [prompt, setPrompt] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        alert(HF_API_TOKEN);
        if (!prompt) return;
        setLoading(true);
        setOutput("");

        const model = MODEL_MAP[task];
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        const result = await response.json();
        const text = result[0]?.generated_text || JSON.stringify(result);
        setOutput(text);
        setLoading(false);
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">AI Writer Pad ✍️</h1>

            <div className="mb-4">
                <select
                    className="p-2 rounded border"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                >
                    <option value="blog">📝 Blog</option>
                    <option value="code">💻 Code</option>
                    <option value="docs">📄 Docs</option>
                </select>
            </div>

            <textarea
                rows={6}
                className="w-full max-w-2xl mb-4 p-2 border rounded"        placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />

            <button
                onClick={generate}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"      >
                {loading ? "Generating..." : "Generate"}
            </button>

            {output && (
                <div className="w-full max-w-2xl mt-6">
                    <h2 className="text-xl font-semibold mb-2">🧠 Output:</h2>
                    <pre className="bg-white p-4 rounded shadow whitespace-pre-wrap">{output}</pre>
                </div>
            )}
        </div>
    );
}
