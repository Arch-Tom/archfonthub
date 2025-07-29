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

    // Auto color logic: white text if frame present, black otherwise
    const textColor = frameStyle !== 'none' && isCircular ? (color || 'white') : (color || 'black');

    const renderLetters = () => {
        if (isCircular) {
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
                            fontSize: `${fontSize}px`,
                            color: textColor
                        }}
                    >
                        {first}
                    </span>
                    <span
                        style={{
                            fontFamily: 'MiddleCircleMonogram',
                            fontSize: `${fontSize}px`,
                            color: textColor
                        }}
                    >
                        {middle}
                    </span>
                    <span
                        style={{
                            fontFamily: 'RightCircleMonogram',
                            fontSize: `${fontSize}px`,
                            color: textColor
                        }}
                    >
                        {last}
                    </span>
                </div>
            );
        }

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

    // Render with optional frame for circular style
    if (frameStyle !== 'none' && isCircular) {
        return (
            <div className="relative flex items-center justify-center w-full h-full">
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 200 200"
                    preserveAspectRatio="xMidYMid meet"
                >
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
                </svg>
                <div className="relative flex items-center justify-center w-[70%] h-[70%]">
                    {renderLetters()}
                </div>
            </div>
        );
    }

    return renderLetters();
}
