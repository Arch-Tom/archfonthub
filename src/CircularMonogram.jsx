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

    // --- UPDATED COLOR LOGIC ---
    // Default to black. Change to white for solid/double frames. Dotted frame remains black.
    let determinedColor = 'black';
    if (isCircular && (frameStyle === 'solid' || frameStyle === 'double')) {
        determinedColor = 'white';
    }
    const textColor = color || determinedColor;

    const renderLetters = () => {
        if (isCircular) {
            // --- FONT SIZE INCREASED ---
            const circularFontSize = fontSize * 1.2; // Font size is 20% larger for circular monograms

            return (
                <div
                    className="flex items-center justify-center"
                    style={{
                        lineHeight: 1,
                        textAlign: 'center',
                        gap: '0.05em'
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'LeftCircleMonogram',
                            fontSize: `${circularFontSize}px`,
                            color: textColor
                        }}
                    >
                        {first}
                    </span>
                    <span
                        style={{
                            fontFamily: 'MiddleCircleMonogram',
                            fontSize: `${circularFontSize}px`,
                            color: textColor
                        }}
                    >
                        {middle}
                    </span>
                    <span
                        style={{
                            fontFamily: 'RightCircleMonogram',
                            fontSize: `${circularFontSize}px`,
                            color: textColor
                        }}
                    >
                        {last}
                    </span>
                </div>
            );
        }

        // This part renders the standard, non-circular monogram
        return (
            <div
                className="flex items-center justify-center"
                style={{
                    lineHeight: 1,
                    textAlign: 'center',
                    gap: '0.05em'
                }}
            >
                <span
                    style={{
                        fontFamily,
                        fontSize: `${disableScaling ? fontSize : fontSize * sideScale}px`,
                        color: textColor
                    }}
                >
                    {first}
                </span>
                <span
                    style={{
                        fontFamily,
                        fontSize: `${disableScaling ? fontSize : fontSize * middleScale}px`,
                        margin: '0 -0.05em',
                        color: textColor
                    }}
                >
                    {middle}
                </span>
                <span
                    style={{
                        fontFamily,
                        fontSize: `${disableScaling ? fontSize : fontSize * sideScale}px`,
                        color: textColor
                    }}
                >
                    {last}
                </span>
            </div>
        );
    };

    // If a frame style is selected for a circular monogram, wrap the letters with the frame SVG.
    if (frameStyle !== 'none' && isCircular) {
        // Adjust container size based on the new, larger font size
        const containerSize = (fontSize * 1.2) * 2;
        return (
            <div className="relative flex items-center justify-center" style={{ width: `${containerSize}px`, height: `${containerSize}px` }}>
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 200 200"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Render the selected frame style */}
                    {frameStyle === 'solid' && (
                        <circle cx="100" cy="100" r="98" fill="black" />
                    )}
                    {frameStyle === 'double' && (
                        <>
                            <circle cx="100" cy="100" r="98" fill="black" />
                            <circle cx="100" cy="100" r="88" fill="none" stroke="white" strokeWidth="3" />
                        </>
                    )}
                    {frameStyle === 'dotted' && (
                        <circle
                            cx="100"
                            cy="100"
                            r="95"
                            fill="none"
                            stroke="black"
                            strokeWidth="4"
                            strokeDasharray="10 10"
                        />
                    )}
                </svg>
                <div className="relative z-10">
                    {renderLetters()}
                </div>
            </div>
        );
    }

    // If no frame is selected, render just the letters.
    return renderLetters();
}