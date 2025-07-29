import React from 'react';

export default function CircularMonogram({
    text = ['A', 'B', 'C'],
    fontSize = 100,
    frameStyle = 'none',
    color = 'black'
}) {
    const [first, middle, last] = text;

    const monogramHTML = (
        <div
            className="flex items-center justify-center"
            style={{
                fontSize: `${fontSize}px`,
                gap: '0.05em',
                color,
                lineHeight: 1,
                textAlign: 'center'
            }}
        >
            <span style={{ fontFamily: 'LeftCircleMonogram', fontSize: `${fontSize}px` }}>
                {first}
            </span>
            <span
                style={{
                    fontFamily: 'MiddleCircleMonogram',
                    fontSize: `${fontSize * 1.5}px`,
                    margin: '0 -0.1em'
                }}
            >
                {middle}
            </span>
            <span style={{ fontFamily: 'RightCircleMonogram', fontSize: `${fontSize}px` }}>
                {last}
            </span>
        </div>
    );

    if (frameStyle !== 'none') {
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
