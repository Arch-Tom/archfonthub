import React from 'react';

export default function CircularMonogram({
    text = ['A', 'B', 'C'],
    fontSize = 100,
    frameStyle = 'none',
    color,
    fontFamily,
    sideScale = 1.2,
    middleScale = 1.6,
    isCircular = false,
    disableScaling = false
}) {
    const [first, middle, last] = text;

    let determinedColor = 'black';
    if (isCircular && (frameStyle === 'solid' || frameStyle === 'double')) {
        determinedColor = 'white';
    }
    const textColor = color || determinedColor;

    // Render standard monograms
    if (!isCircular) {
        return (
            <div
                className="flex items-center justify-center"
                style={{
                    lineHeight: 1,
                    textAlign: 'center',
                    gap: '0.05em'
                }}
            >
                <span style={{ fontFamily, fontSize: `${disableScaling ? fontSize : fontSize * sideScale}px`, color: textColor }}>
                    {first}
                </span>
                <span style={{ fontFamily, fontSize: `${disableScaling ? fontSize : fontSize * middleScale}px`, margin: '0 -0.05em', color: textColor }}>
                    {middle}
                </span>
                <span style={{ fontFamily, fontSize: `${disableScaling ? fontSize : fontSize * sideScale}px`, color: textColor }}>
                    {last}
                </span>
            </div>
        );
    }

    // --- NEW SVG-BASED RENDERING FOR CIRCULAR MONOGRAMS ---
    const circularFontSize = fontSize * 1.5;
    const containerSize = circularFontSize * 2;

    return (
        <div className="relative flex items-center justify-center" style={{ width: `${containerSize}px`, height: `${containerSize}px` }}>
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 200 200"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Frames */}
                {frameStyle === 'solid' && (
                    <circle cx="100" cy="100" r="64" fill="black" />
                )}
                {frameStyle === 'double' && (
                    <>
                        <circle cx="100" cy="100" r="64" fill="black" />
                        <circle cx="100" cy="100" r="59" fill="none" stroke="white" strokeWidth="3" />
                    </>
                )}
                {frameStyle === 'dotted' && (
                    <circle cx="100" cy="100" r="64" fill="none" stroke="black" strokeWidth="4" strokeDasharray="10 10" />
                )}

                {/* Monogram Text rendered inside SVG for perfect centering */}
                <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textColor}
                    style={{ fontSize: `${circularFontSize * 0.4}px` }} // Adjusted font size for SVG text
                >
                    <tspan fontFamily="LeftCircleMonogram">{first}</tspan>
                    <tspan fontFamily="MiddleCircleMonogram" dy="-0.02em">{middle}</tspan>
                    <tspan fontFamily="RightCircleMonogram">{last}</tspan>
                </text>
            </svg>
        </div>
    );
}