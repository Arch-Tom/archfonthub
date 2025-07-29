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
    frameStyle = 'none'
}) {
    const middleFontSize = disableScaling ? fontSize : fontSize * middleScale;

    // Circular monogram with frame
    if (frameStyle !== 'none') {
        return (
            <svg
                width="200"
                height="200"
                viewBox="-10 -10 220 220"
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

                {/* Letters with improved spacing */}
                <text
                    x={100 - fontSize * 1.5}
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    style={{ fontFamily: firstFont || fontFamily, fontSize: fontSize * 0.9 }}
                >
                    {first}
                </text>
                <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    style={{ fontFamily: middleFont || fontFamily, fontSize }}
                >
                    {middle}
                </text>
                <text
                    x={100 + fontSize * 1.5}
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    style={{ fontFamily: lastFont || fontFamily, fontSize: fontSize * 0.9 }}
                >
                    {last}
                </text>
            </svg>
        );
    }

    // Default (non-circular or no frame)
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
