import React, { useState } from "react";

function SearchForm({ hasSearched, onSearch, onClear }) {
    const [videoId, setVideoId] = useState("");
    const [query, setQuery] = useState("");
    const [language, setLanguage] = useState("en");
    const [threshold, setThreshold] = useState(80);

    const handleSubmit = (e) => {
        e.preventDefault();
        const youtubeUrlPattern = new RegExp(
            /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/g
        );

        if (!videoId.match(youtubeUrlPattern)) {
            alert("Please enter a valid YouTube URL!");
            return;
        }

        if (!query) {
            alert("Please fill in the query!");
            return;
        }

        onSearch({ videoId, query, language, threshold });
    };

    const handleClear = (e) => {
        e.preventDefault();
        // Reset all input fields by updating their respective state
        setVideoId("");
        setQuery("");
        setLanguage("en"); // Reset to default language
        setThreshold(80);  // Reset threshold to its default
        onClear();
    }

    return (
        <form
            id="searchForm"
            onSubmit={handleSubmit}
            style={{ marginBottom: "20px" }}>

            <div style={{ marginBottom: "10px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", margin: "0" }}>
                    Enter a valid YouTube URL:
                </p>
                <ul style={{ margin: "4px 0 8px 16px", fontSize: "12px" }}>
                    <code>https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID</code>
                </ul>
                <hr style={{ border: "1px solid #ddd", margin: "10px 0" }} /> {/* Horizontal Line */}
            </div>


            <div style={{ marginBottom: "10px" }}>
                <input
                    type="text"
                    placeholder="YouTube Video Url"
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                    required
                    style={{
                        padding: "10px",
                        width: "300px",
                        marginRight: "10px",
                    }}
                />

            </div>
            <div style={{ marginBottom: "10px" }}>
                <input
                    type="text"
                    placeholder="Search Query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                    style={{
                        padding: "10px",
                        width: "300px",
                        marginRight: "10px",
                    }}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                        padding: "10px",
                        width: "300px",
                        marginRight: "10px",
                    }}
                >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                </select>
            </div>
            <div style={{ marginBottom: "10px" }}>
                <input
                    type="range"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    min="0"
                    max="100"
                    step="1" // Optional: Adjust the step for finer control
                    style={{
                        width: "300px",
                        marginRight: "10px",
                        accentColor: "#444", // Optional: Change the slider's color
                    }}
                />
                <p>Threshold: {threshold}</p>

            </div>
            <button type="submit" style={{ padding: "10px 20px" }}>
                Search
            </button>
            {hasSearched && (
                <button
                    type="button"
                    onClick={handleClear}
                    style={{
                        padding: "10px 20px",
                        marginTop: "10px",
                        background: "#444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Clear/Reset
                </button>
            )}
        </form>
    );
}

export default SearchForm;