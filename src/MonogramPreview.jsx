import React from 'react';

export default function MonogramPreview({
    first = 'N',
    middle = 'X',
    last = 'D',
    fontFamily,
    fontSize = 100,
    middleScale = 1.5,
    className = '',
    style = {}
}) {
    // Calculate the font size for the larger middle initial
    const middleFontSize = fontSize * middleScale;

    return (
        <div
            // The main container uses flexbox to vertically center the initials
            className={`flex items-center justify-center select-none ${className}`}
            style={{
                fontFamily,
                ...style
            }}
        >
            {/* First initial with the base font size */}
            <span style={{ fontSize: `${fontSize}px` }}>{first}</span>

            {/* Middle initial with a larger font size and negative margin for kerning */}
            <span
                style={{
                    fontSize: `${middleFontSize}px`,
                    margin: '0 -0.1em', // Pulls the side letters closer
                }}
            >
                {middle}
            </span>

            {/* Last initial with the base font size */}
            <span style={{ fontSize: `${fontSize}px` }}>{last}</span>
        </div>
    );
}