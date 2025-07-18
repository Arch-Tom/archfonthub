// MonogramPreview.jsx
import React from 'react';

export default function MonogramPreview({
    first = 'F',
    middle = 'M',
    last = 'L',
    fontFamily,
    fontSize = 100,
    middleScale = 1.5,
    letterSpacing = '0.05em',
    className = '',
    style = {}
}) {
    // Calculate the tallest letter to set container height (prevents layout shift)
    const previewHeight = fontSize * middleScale;

    return (
        <div
            className={`flex items-center justify-center select-none ${className}`}
            style={{
                fontFamily,
                fontSize,
                lineHeight: 1,
                letterSpacing,
                height: previewHeight,
                ...style
            }}
        >
            <span style={{ display: 'inline-block', lineHeight: 1 }}>{first}</span>
            <span
                style={{
                    display: 'inline-block',
                    transform: `scale(${middleScale})`,
                    lineHeight: 1,
                    margin: '0 0.08em',
                }}
            >
                {middle}
            </span>
            <span style={{ display: 'inline-block', lineHeight: 1 }}>{last}</span>
        </div>
    );
}
