import React, { useState } from "react";

function Results({ results }) {
    const [sortBy, setSortBy] = useState("similarity"); // Default sort by similarity
    const [filterThreshold, setFilterThreshold] = useState(0); // Additional filtering

    // Check if results object has the expected structure
    if (!results || !results.matches) {
        return <p>No results found or try adjusting your query.</p>;
    }

    const { matches, metadata } = results;

    if (matches.length === 0) {
        return <p>No matches found for your query. Try adjusting your search terms or threshold.</p>;
    }

    // Sort and filter the matches
    const sortedMatches = [...matches]
        .filter(match => match.similarity >= filterThreshold)
        .sort((a, b) => {
            if (sortBy === "similarity") return b.similarity - a.similarity;
            if (sortBy === "timestamp") return a.start - b.start;
            return 0;
        });

    return (
        <div>
            <h2>Search Results</h2>

            {/* Show metadata about the search */}
            <div style={{
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                maxWidth: "700px",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <h3 style={{ marginTop: "0", color: "#333" }}>Search Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                        <p><strong>Query:</strong> "{metadata.query}"</p>
                        <p><strong>Match Threshold:</strong> {metadata.threshold}%</p>
                    </div>
                    <div>
                        <p><strong>Results Found:</strong> {metadata.match_count}</p>
                        <p>
                            <strong>Language:</strong> {metadata.used_language}
                            {metadata.used_language !== metadata.requested_language && (
                                <span style={{ color: "#cc7000", fontWeight: "500" }}>
                                    {" "}(requested: {metadata.requested_language})
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                {metadata.available_languages && metadata.available_languages.length > 0 && (
                    <p><strong>Available Languages:</strong> {metadata.available_languages.join(", ")}</p>
                )}
            </div>

            {/* Results controls */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                maxWidth: "700px",
                margin: "0 auto 15px",
                padding: "10px",
                background: "#f0f0f0",
                borderRadius: "8px",
                alignItems: "center"
            }}>
                <div>
                    <label htmlFor="sortBy" style={{ marginRight: "10px" }}>Sort by:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: "5px", borderRadius: "4px" }}
                    >
                        <option value="similarity">Relevance</option>
                        <option value="timestamp">Time in Video</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="filterThreshold" style={{ marginRight: "10px" }}>
                        Min Similarity: {filterThreshold}%
                    </label>
                    <input
                        id="filterThreshold"
                        type="range"
                        min="0"
                        max="100"
                        value={filterThreshold}
                        onChange={(e) => setFilterThreshold(e.target.value)}
                        style={{ width: "120px", verticalAlign: "middle" }}
                    />
                </div>
                <div>
                    <span>{sortedMatches.length} of {matches.length} shown</span>
                </div>
            </div>

            {/* Display search results */}
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {sortedMatches.map((result, index) => (
                    <li
                        key={index}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            margin: "15px auto",
                            borderRadius: "8px",
                            textAlign: "left",
                            maxWidth: "700px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            position: "relative",
                            borderLeft: `4px solid ${getColorByScore(result.similarity)}`
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                        }}
                    >
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "10px",
                            borderBottom: "1px solid #eee",
                            paddingBottom: "8px"
                        }}>
                            <div>
                                <span style={{
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    color: "#333"
                                }}>
                                    {result.timestamp || `${Math.floor(result.start / 60)}:${(result.start % 60).toString().padStart(2, '0')}`}
                                </span>
                                <span style={{
                                    marginLeft: "15px",
                                    color: "#666",
                                    fontSize: "14px"
                                }}>
                                    Duration: {result.duration}s
                                </span>
                            </div>
                            <div style={{
                                backgroundColor: getColorByScore(result.similarity),
                                color: "white",
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "bold"
                            }}>
                                {result.similarity}%
                            </div>
                        </div>

                        <p style={{
                            fontSize: "16px",
                            lineHeight: "1.5",
                            marginBottom: "15px",
                            color: "#333"
                        }}>
                            {result.text}
                        </p>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            {result.language && (
                                <span style={{
                                    color: "#666",
                                    fontSize: "14px"
                                }}>
                                    Language: {result.language}
                                </span>
                            )}

                            <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: "#fff",
                                    backgroundColor: "#FF0000",
                                    padding: "8px 12px",
                                    borderRadius: "4px",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    fontWeight: "500",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    transition: "background-color 0.2s"
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#CC0000";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "#FF0000";
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
                                    <path fill="currentColor" d="M10,16.5V7.5L16,12L10,16.5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                                </svg>
                                Watch on YouTube
                            </a>
                        </div>
                    </li>
                ))}
            </ul>

            {sortedMatches.length === 0 && (
                <p style={{ color: "#666" }}>
                    No results match your current filters. Try lowering the similarity threshold.
                </p>
            )}
        </div>
    );
}

// Helper function to get color based on similarity score
function getColorByScore(score) {
    if (score >= 90) return "#4CAF50"; // Green
    if (score >= 80) return "#8BC34A"; // Light Green
    if (score >= 70) return "#CDDC39"; // Lime
    if (score >= 60) return "#FFC107"; // Amber
    if (score >= 50) return "#FF9800"; // Orange
    return "#FF5722"; // Deep Orange
}

export default Results;