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

    const renderLetters = () => {
        if (isCircular) {
            const circularFontSize = fontSize * 1.5;

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

    if (frameStyle !== 'none' && isCircular) {
        const containerSize = (fontSize * 1.5) * 2;
        return (
            <div className="relative flex items-center justify-center" style={{ width: `${containerSize}px`, height: `${containerSize}px` }}>
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 200 200"
                    preserveAspectRatio="xMidYMid meet"
                >
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
                </svg>
                {/* --- CENTERED TEXT CONTAINER --- */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {renderLetters()}
                </div>
            </div>
        );
    }

    return renderLetters();
}