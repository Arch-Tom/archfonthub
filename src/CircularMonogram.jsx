import React, { useEffect } from 'react';

export default function CircularMonogram({
    text = ['A', 'B', 'C'],
    fontSize = 100,
    frameStyle = 'none',
    color = 'black',
    isCircular = false,
}) {
    const [first, middle, last] = text;

    // Debug logs
    useEffect(() => {
        console.log('CircularMonogram props:', { text, fontSize, frameStyle, color, isCircular });
    }, [text, fontSize, frameStyle, color, isCircular]);

    const letters = isCircular ? (
        <>
            <span style={{ fontFamily: 'LeftCircleMonogram', fontSize: `${fontSize}px`, color }}>{first}</span>
            <span style={{ fontFamily: 'MiddleCircleMonogram', fontSize: `${fontSize}px`, color }}>{middle}</span>
            <span style={{ fontFamily: 'RightCircleMonogram', fontSize: `${fontSize}px`, color }}>{last}</span>
        </>
    ) : (
        <>
            <span style={{ fontSize: `${fontSize}px`, color }}>{first}</span>
            <span style={{ fontSize: `${fontSize * 1.5}px`, margin: '0 -0.05em', color }}>{middle}</span>
            <span style={{ fontSize: `${fontSize}px`, color }}>{last}</span>
        </>
    );

    // Temporarily ignore frameStyle for debugging
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.1em',
                background: '#f8f8f8', // debug background
                padding: '10px',
                border: '1px dashed red', // debug border
            }}
        >
            {letters}
        </div>
    );
}
