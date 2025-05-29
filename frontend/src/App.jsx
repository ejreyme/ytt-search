import { useState } from 'react';
import './App.css';
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";

function App() {
    const [results, setResults] = useState(null);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (searchData) => {
        setHasSearched(true);
        setLoading(true);
        setError("");

        try {
            // Make sure we're only sending the video ID
            const videoId = searchData.videoId; // This should now be just the ID from the form
            const response = await fetch(
                `/api/search?video_id=${encodeURIComponent(videoId)}&query=${encodeURIComponent(searchData.query)}&language=${searchData.language}&threshold=${searchData.threshold}`
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "An unknown error occurred!");
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || "Something went wrong!");
            setResults(null);
        } finally {
            setLoading(false);
        }
    };


    const handleClear = () => {
        setResults(null);
        setError("");
        setHasSearched(false);
    };

    return (
        <div className="app-container" style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "20px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
        }}>
            <header style={{ textAlign: "center", marginBottom: "30px" }}>
                <h1 style={{
                    color: "#333",
                    fontSize: "32px",
                    marginBottom: "5px"
                }}>YouTube Transcript Search</h1>
                <p style={{
                    color: "#666",
                    fontSize: "16px",
                    margin: "0 auto",
                    maxWidth: "600px"
                }}>
                    Search for specific words or phrases in YouTube video transcripts
                </p>
            </header>

            <SearchForm
                hasSearched={hasSearched}
                onSearch={handleSearch}
                onClear={handleClear}
            />

            {loading && (
                <div style={{ textAlign: "center", margin: "40px 0" }}>
                    <div style={{
                        display: "inline-block",
                        width: "40px",
                        height: "40px",
                        border: "4px solid #f3f3f3",
                        borderTop: "4px solid #1a73e8",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                    <p style={{ color: "#666", marginTop: "15px" }}>Searching the transcript...</p>
                </div>
            )}

            {!loading && !hasSearched && (
                <div style={{
                    textAlign: "center",
                    margin: "60px 0",
                    padding: "30px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                }}>
                    <h3 style={{ color: "#333", marginTop: "0" }}>Welcome to YouTube Transcript Search</h3>
                    <p style={{ color: "#666" }}>
                        Enter a YouTube URL and a search term to find specific moments in videos.
                    </p>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20px",
                        flexWrap: "wrap",
                        gap: "15px"
                    }}>
                        {["Find key moments", "Search for phrases", "Jump to timestamps", "Multiple languages"].map(feature => (
                            <div key={feature} style={{
                                padding: "10px 15px",
                                backgroundColor: "#e8eaf6",
                                borderRadius: "20px",
                                fontSize: "14px",
                                color: "#3f51b5"
                            }}>
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && error && (
                <div style={{
                    margin: "30px auto",
                    padding: "15px",
                    backgroundColor: "#ffebee",
                    borderRadius: "8px",
                    borderLeft: "4px solid #f44336",
                    color: "#d32f2f",
                    maxWidth: "700px"
                }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>Error</h3>
                    <p style={{ margin: "0" }}>{error}</p>
                </div>
            )}

            {!loading && hasSearched && results && results.matches && (
                <Results results={results} />
            )}

            {!loading && hasSearched && results && !results.matches && !error && (
                <div style={{
                    margin: "30px auto",
                    padding: "20px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "8px",
                    borderLeft: "4px solid #4caf50",
                    color: "#2e7d32",
                    maxWidth: "700px",
                    textAlign: "center"
                }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>No Results Found</h3>
                    <p style={{ margin: "0" }}>
                        Try different search terms or adjust your similarity threshold.
                    </p>
                </div>
            )}

            <footer style={{
                marginTop: "50px",
                textAlign: "center",
                color: "#999",
                fontSize: "14px",
                padding: "20px 0"
            }}>
                <p>© 2025 YouTube Transcript Search</p>
            </footer>
        </div>
    );
}

export default App;