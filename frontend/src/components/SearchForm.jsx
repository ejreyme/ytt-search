import React, { useState, useEffect } from "react";

function SearchForm({ hasSearched, onSearch, onClear }) {
    const [videoId, setVideoId] = useState("");
    const [query, setQuery] = useState("");
    const [language, setLanguage] = useState("en");
    const [threshold, setThreshold] = useState(80);
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    const LANGUAGES = [
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "it", name: "Italian" },
        { code: "pt", name: "Portuguese" },
        { code: "ru", name: "Russian" },
        { code: "ja", name: "Japanese" },
        { code: "ko", name: "Korean" },
        { code: "zh-cn", name: "Chinese (Simplified)" },
        { code: "ar", name: "Arabic" },
        { code: "hi", name: "Hindi" }
    ];

    // Validate form whenever inputs change
    useEffect(() => {
        const youtubeUrlPattern = new RegExp(
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/
        );

        setIsValid(youtubeUrlPattern.test(videoId) && query.trim().length > 0);
    }, [videoId, query]);

    const extractVideoIdFromUrl = (url) => {
        // Check if it's already just a video ID
        if (/^[A-Za-z0-9_-]{11,12}$/.test(url)) {
            return url;
        }

        try {
            // Try to parse it as a URL
            const urlObj = new URL(url);

            // Handle youtube.com URLs
            if (urlObj.hostname.includes('youtube.com')) {
                return urlObj.searchParams.get('v') || '';
            }
            // Handle youtu.be URLs
            else if (urlObj.hostname.includes('youtu.be')) {
                return urlObj.pathname.substring(1);
            }
        } catch (e) {
            // Not a valid URL, return as is
            console.error("Invalid URL format:", e);
        }

        return url; // Return as is if we couldn't extract a video ID
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid) {
            return;
        }

        setLoading(true);

        // Extract just the video ID before sending
        const processedVideoId = extractVideoIdFromUrl(videoId);

        await onSearch({
            videoId: processedVideoId,  // Send just the ID, not the full URL
            query,
            language,
            threshold
        });

        setLoading(false);
    };


    const handleClear = (e) => {
        e.preventDefault();
        setVideoId("");
        setQuery("");
        setLanguage("en");
        setThreshold(80);
        onClear();
    };

    return (
        <div style={{
            maxWidth: "700px",
            margin: "0 auto 30px",
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
            <form
                id="searchForm"
                onSubmit={handleSubmit}
            >
                <div style={{ marginBottom: "20px", textAlign: "left" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Search YouTube Transcript</h3>
                    <p style={{ fontSize: "14px", color: "#666", margin: "0 0 5px 0" }}>
                        Enter a YouTube URL or video ID:
                    </p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="videoId" style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#555"
                    }}>
                        YouTube Video URL
                    </label>
                    <input
                        id="videoId"
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                        value={videoId}
                        onChange={(e) => setVideoId(e.target.value)}
                        required
                        style={{
                            padding: "10px 12px",
                            width: "100%",
                            boxSizing: "border-box",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "16px"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="query" style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#555"
                    }}>
                        Search Query
                    </label>
                    <input
                        id="query"
                        type="text"
                        placeholder="What to search for in the transcript"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        required
                        style={{
                            padding: "10px 12px",
                            width: "100%",
                            boxSizing: "border-box",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "16px"
                        }}
                    />
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginBottom: "20px"
                }}>
                    <div>
                        <label htmlFor="language" style={{
                            display: "block",
                            marginBottom: "5px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#555"
                        }}>
                            Preferred Language
                        </label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{
                                padding: "10px 12px",
                                width: "100%",
                                boxSizing: "border-box",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "16px",
                                backgroundColor: "white"
                            }}
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="threshold" style={{
                            display: "block",
                            marginBottom: "5px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#555"
                        }}>
                            Match Threshold: {threshold}%
                        </label>
                        <input
                            id="threshold"
                            type="range"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                            min="0"
                            max="100"
                            step="5"
                            style={{
                                width: "100%",
                                accentColor: "#1a73e8",
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    {hasSearched && (
                        <button
                            type="button"
                            onClick={handleClear}
                            style={{
                                padding: "10px 16px",
                                background: "#f5f5f5",
                                color: "#333",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                transition: "background-color 0.2s"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#e0e0e0";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#f5f5f5";
                            }}
                        >
                            Clear
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={!isValid || loading}
                        style={{
                            padding: "10px 20px",
                            background: isValid ? "#1a73e8" : "#ccc",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: isValid ? "pointer" : "not-allowed",
                            fontSize: "16px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "100px",
                            transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => {
                            if (isValid && !loading) {
                                e.currentTarget.style.backgroundColor = "#0d62d1";
                            }
                        }}
                        onMouseOut={(e) => {
                            if (isValid && !loading) {
                                e.currentTarget.style.backgroundColor = "#1a73e8";
                            }
                        }}
                    >
                        {loading ? (
                            <span style={{ display: "flex", alignItems: "center" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" style={{
                                    animation: "rotate 1s linear infinite",
                                    marginRight: "8px"
                                }}>
                                    <style>{`
                                        @keyframes rotate {
                                            from { transform: rotate(0deg); }
                                            to { transform: rotate(360deg); }
                                        }
                                    `}</style>
                                    <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                                </svg>
                                Searching...
                            </span>
                        ) : "Search"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SearchForm;