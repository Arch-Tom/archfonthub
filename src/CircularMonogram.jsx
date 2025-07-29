import React from 'react';

export default function CircularMonogram({
    text = ['A', 'B', 'C'],
    fontSize = 100,
    frameStyle = 'none',
    color = 'black',
    fontFamily,
    sideScale = 1.2,
    middleScale = 1.6,
    isCircular = false,
    disableScaling = false
}) {
    const [first, middle, last] = text;

    const renderMonogramLetters = () => {
        if (isCircular) {
            return (
                <>
                    <span
                        style={{
                            fontFamily: 'LeftCircleMonogram',
                            fontSize: `${fontSize}px`,
                            color
                        }}
                    >
                        {first}
                    </span>
                    <span
                        style={{
                            fontFamily: 'MiddleCircleMonogram',
                            fontSize: `${fontSize}px`,
                            color
                        }}
                    >
                        {middle}
                    </span>
                    <span
                        style={{
                            fontFamily: 'RightCircleMonogram',
                            fontSize: `${fontSize}px`,
                            color
                        }}
                    >
                        {last}
                    </span>
                </>
            );
        }

        return (
            <>
                <span
                    style={{
                        fontFamily,
                        fontSize: `${disableScaling ? fontSize : fontSize * sideScale}px`,
                        color
                    }}
                >
                    {first}
                </span>
                <span
                    style={{
                        fontFamily,
                        fontSize: `${disableScaling ? fontSize : fontSize * middleScale}px`,
                        margin: '0 0.05em',
                        color
                    }}
                >
                    {middle}
                </span>
                <span
                    style={{
                        fontFamily,
                        fontSize: `${disableScaling ? fontSize : fontSize * sideScale}px`,
                        color
                    }}
                >
                    {last}
                </span>
            </>
        );
    };

    const monogramHTML = (
        <div
            className="flex items-center justify-center gap-1"
            style={{
                lineHeight: 1,
                textAlign: 'center'
            }}
        >
            {renderMonogramLetters()}
        </div>
    );

    if (frameStyle !== 'none' && isCircular) {
        return (
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 200"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
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

                <foreignObject x="0" y="0" width="200" height="200">
                    <div className="flex items-center justify-center w-full h-full">
                        {monogramHTML}
                    </div>
                </foreignObject>
            </svg>
        );
    }

    return monogramHTML;
}
