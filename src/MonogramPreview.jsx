import React from 'react';

export default function MonogramPreview({
    first = 'N',
    middle = 'X',
    last = 'D',
    fontFamily,
    fontSize = 100,
    middleScale = 1.3,
    className = '',
    style = {},
    disableScaling = false,
    frameStyle = 'none'
}) {
    const middleFontSize = disableScaling ? fontSize : fontSize * middleScale;

    if (frameStyle !== 'none') {
        return (
            <svg
                width="200"
                height="200"
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

                {/* Letters closer to center */}
                <text
                    x={100 - fontSize * 0.8}
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="red" // debug color
                    style={{ fontFamily: 'MiddleCircleMonogram', fontSize: fontSize * 0.8 }}
                >
                    {first}
                </text>
                <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    style={{ fontFamily: 'MiddleCircleMonogram', fontSize }}
                >
                    {middle}
                </text>
                <text
                    x={100 + fontSize * 0.8}
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="blue" // debug color
                    style={{ fontFamily: 'MiddleCircleMonogram', fontSize: fontSize * 0.8 }}
                >
                    {last}
                </text>
            </svg>
        );
    }

    return (
        <div
            className={`flex items-center justify-center select-none ${className}`}
            style={{ fontSize: `${fontSize}px`, ...style }}
        >
            <span style={{ fontFamily: 'MiddleCircleMonogram', fontSize: `${fontSize}px` }}>{first}</span>
            <span style={{ fontFamily: 'MiddleCircleMonogram', fontSize: `${middleFontSize}px` }}>{middle}</span>
            <span style={{ fontFamily: 'MiddleCircleMonogram', fontSize: `${fontSize}px` }}>{last}</span>
        </div>
    );
}
