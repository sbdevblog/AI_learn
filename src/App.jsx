import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const HUGGINGFACE_API_KEY = "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"; // Replace with your key

const MODEL_MAP = {
    blog: "openfree/flux-chatgpt-ghibli-lora",
    code: "Salesforce/codegen-350M-mono",
    docs: "google/flan-t5-base",
};

const App = () => {
    const [inputText, setInputText] = useState("");
    const [selectedType, setSelectedType] = useState("blog");
    const [selectedLength, setSelectedLength] = useState("medium");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [generateImageFlag, setGenerateImageFlag] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    const generatePrompt = (type, prompt, length) => {
        const lengthMap = {
            short: "Keep the response short and concise.",
            medium: "Provide a moderate-length response with some details.",
            long: "Write a detailed and extensive response.",
        };
        return `${prompt}\n\n${lengthMap[length] || ""}`;
    };

    const handleGenerate = async () => {
        setLoading(true);
        const prompt = generatePrompt(selectedType, inputText, selectedLength);
        const model = MODEL_MAP[selectedType];
        try {
            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${model}`,
                { inputs: inputText },
                {
                    headers: {
                        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    },
                }
            );

            if (response?.data?.error) {
                setResult("⚠️ API Error: " + response.data.error);
            } else {
                if (generateImageFlag) {
                    await handleImageGeneration(inputText);
                } else {
                    setResult(typeof response.data === "string" ? response.data : JSON.stringify(response.data));
                }

            }

            if (generateImageFlag) {
                await handleImageGeneration(inputText);
            }
        } catch (err) {
            setResult("Error generating content: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageGeneration = async (prompt) => {
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
                { inputs: prompt },
                {
                    headers: {
                        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                        Accept: "application/json",
                    },
                    responseType: "arraybuffer",
                }
            );

            const imageBlob = new Blob([response.data], { type: "image/png" });
            const imageUrl = URL.createObjectURL(imageBlob);
            setGeneratedImage(imageUrl);
        } catch (error) {
            console.error("Image generation failed:", error);
        }
    };

    return (
        <div className="container">
            <h1>🧠 AI Writer Generator By Sameer Bhayani</h1>

            <textarea
                placeholder="Enter your instruction here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />

            <div className="controls">
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="blog">📝 Create Image</option>
                    <option value="code">💻 Code</option>
                    <option value="docs">📚 Documentation</option>
                </select>

                {/*<select value={selectedLength} onChange={(e) => setSelectedLength(e.target.value)}>*/}
                {/*    <option value="short">Short</option>*/}
                {/*    <option value="medium">Medium</option>*/}
                {/*    <option value="long">Long</option>*/}
                {/*</select>*/}
                <label>
                    <input
                        type="checkbox"
                        checked={generateImageFlag}
                        onChange={() => setGenerateImageFlag(!generateImageFlag)}
                    />{" "}
                    Generate image
                </label>
            </div>

            <button onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate"}
            </button>

            {result && (
                <div className="output">
                    <h3>🧾 Output</h3>
                    <pre>{result}</pre>
                </div>
            )}

            {generatedImage && (
                <div className="output">
                    <h3>🖼️ AI Generated Image</h3>
                    <img src={generatedImage} alt="Generated by AI" />
                </div>
            )}
        </div>
    );
};

export default App;
