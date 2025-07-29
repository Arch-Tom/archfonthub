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
            className="flex items-center justify-center h-full w-full"
            style={{
                fontSize: `${fontSize}px`,
                gap: '0.05em',
                color: color,
                lineHeight: 1,
                textAlign: 'center'
            }}
        >
            <span
                className="leading-none"
                style={{ fontFamily: 'LeftCircleMonogram', fontSize: `${fontSize}px` }}
            >
                {first}
            </span>
            <span
                className="leading-none"
                style={{
                    fontFamily: 'MiddleCircleMonogram',
                    fontSize: `${fontSize * 1.5}px`,
                    margin: '0 -0.1em'
                }}
            >
                {middle}
            </span>
            <span
                className="leading-none"
                style={{ fontFamily: 'RightCircleMonogram', fontSize: `${fontSize}px` }}
            >
                {last}
            </span>
        </div>
    );

    // Frame rendering for circular monogram
    if (frameStyle !== 'none') {
        return (
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 200"
                className="max-w-[200px] max-h-[200px] md:max-w-[250px] md:max-h-[250px]"
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

                {/* Use foreignObject for perfect spacing */}
                <foreignObject x="0" y="0" width="200" height="200">
                    <div className="w-full h-full flex items-center justify-center">
                        {monogramHTML}
                    </div>
                </foreignObject>
            </svg>
        );
    }

    // No frame
    return (
        <div
            className="flex items-center justify-center select-none"
            style={{
                fontSize: `${fontSize}px`,
                gap: '0.05em',
                color: color,
                lineHeight: 1,
                textAlign: 'center'
            }}
        >
            {monogramHTML}
        </div>
    );
}
