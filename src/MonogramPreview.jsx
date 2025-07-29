import React from 'react';

export default function MonogramPreview({
    first = 'N',
    middle = 'X',
    last = 'D',
    fontFamily,
    firstFont,
    middleFont,
    lastFont,
    fontSize = 100,
    middleScale = 1.5,
    letterSpacing = '0.05em',
    className = '',
    style = {},
    disableScaling = false,
    frameStyle = 'none' // New: frame style for circular monograms
}) {
    const middleFontSize = disableScaling ? fontSize : fontSize * middleScale;

    // For circular monograms with frames, we wrap everything in an SVG
    if (frameStyle !== 'none') {
        return (
            <svg
                width="180"
                height="180"
                viewBox="0 0 200 200"
                className={`flex items-center justify-center ${className}`}
                style={style}
            >
                {/* Frame styles */}
                {frameStyle === 'solid' && (
                    <circle cx="100" cy="100" r="90" fill="black" stroke="white" strokeWidth="3" />
                )}
                {frameStyle === 'double' && (
                    <>
                        <circle cx="100" cy="100" r="90" fill="black" stroke="white" strokeWidth="3" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" />
                    </>
                )}
                {frameStyle === 'dotted' && (
                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="black"
                        stroke="white"
                        strokeWidth="3"
                        strokeDasharray="6 6"
                    />
                )}

                {/* Text */}
                <text
                    x="50"
                    y="115"
                    textAnchor="middle"
                    fill="white"
                    style={{ fontFamily: firstFont || fontFamily, fontSize }}
                >
                    {first}
                </text>
                <text
                    x="100"
                    y="115"
                    textAnchor="middle"
                    fill="white"
                    style={{ fontFamily: middleFont || fontFamily, fontSize: middleFontSize }}
                >
                    {middle}
                </text>
                <text
                    x="150"
                    y="115"
                    textAnchor="middle"
                    fill="white"
                    style={{ fontFamily: lastFont || fontFamily, fontSize }}
                >
                    {last}
                </text>
            </svg>
        );
    }

    // Default behavior (no frame)
    return (
        <div
            className={`flex items-center justify-center select-none ${className}`}
            style={{
                fontSize: `${fontSize}px`,
                gap: letterSpacing,
                ...style
            }}
        >
            <span style={{ fontFamily: firstFont || fontFamily, fontSize: `${fontSize}px` }}>{first}</span>
            <span style={{ fontFamily: middleFont || fontFamily, fontSize: `${middleFontSize}px` }}>
                {middle}
            </span>
            <span style={{ fontFamily: lastFont || fontFamily, fontSize: `${fontSize}px` }}>{last}</span>
        </div>
    );
}
