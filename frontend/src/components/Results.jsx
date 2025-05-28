import React from "react";

function Results({ results }) {
    // Check if results object has the expected structure
    if (!results || !results.matches) {
        return <p>No results found or try adjusting your query.</p>;
    }

    const { matches, metadata } = results;

    if (matches.length === 0) {
        return <p>No matches found for your query. Try adjusting your search terms or threshold.</p>;
    }

    return (
        <div>
            <h2>Search Results:</h2>

            {/* Show metadata about the search */}
            <div style={{
                background: "#f5f5f5",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "20px",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left"
            }}>
                <h3 style={{ marginTop: "0" }}>Search Information:</h3>
                <p><strong>Query:</strong> "{metadata.query}"</p>
                <p><strong>Match Threshold:</strong> {metadata.threshold}%</p>
                <p><strong>Results Found:</strong> {metadata.match_count}</p>
                <p>
                    <strong>Language:</strong> {metadata.used_language}
                    {metadata.used_language !== metadata.requested_language && (
                        <span style={{ color: "#cc7000" }}>
                            {" "}(requested: {metadata.requested_language})
                        </span>
                    )}
                </p>
                {metadata.available_languages && metadata.available_languages.length > 0 && (
                    <p><strong>Available Languages:</strong> {metadata.available_languages.join(", ")}</p>
                )}
            </div>

            {/* Display search results */}
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {matches.map((result, index) => (
                    <li
                        key={index}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            margin: "10px",
                            borderRadius: "8px",
                            textAlign: "left",
                            maxWidth: "600px",
                            marginLeft: "auto",
                            marginRight: "auto",
                        }}
                    >
                        <p>
                            <strong>Timestamp:</strong> {result.timestamp || `${Math.floor(result.start / 60)}:${(result.start % 60).toString().padStart(2, '0')}`}
                        </p>
                        <p>
                            <strong>Text:</strong> {result.text}
                        </p>
                        <p>
                            <strong>Duration:</strong> {result.duration}s
                        </p>
                        <p>
                            <strong>Similarity:</strong> {result.similarity}%
                        </p>
                        {result.language && (
                            <p>
                                <strong>Language:</strong> {result.language}
                            </p>
                        )}
                        <p>
                            <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: "#fff",
                                    backgroundColor: "#c00",
                                    padding: "5px 10px",
                                    borderRadius: "4px",
                                    textDecoration: "none",
                                    display: "inline-block"
                                }}
                            >
                                Watch on YouTube
                            </a>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Results;