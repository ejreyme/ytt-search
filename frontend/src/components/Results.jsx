import React from "react";

function Results({ results }) {
    // if (!results.length) {
    //     return <p>No results found or try adjusting your query.</p>;
    // }

    return (
        <div>
            <h2>Search Results:</h2>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {results.map((result, index) => (
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
                            <strong>Start:</strong> {result.start}s
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
                        <p>
                            <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "blue" }}
                            >
                                Watch Segment
                            </a>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Results;