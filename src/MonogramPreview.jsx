import React from 'react';

export default function MonogramPreview({
    first = 'N',
    middle = 'X',
    last = 'D',
    fontFamily,
    fontSize = 100,
    middleScale = 1.5,
    letterSpacing = '0.05em', // This now controls the gap for consistent spacing
    className = '',
    style = {}
}) {
    const middleFontSize = fontSize * middleScale;

    return (
        <div
            className={`flex items-center justify-center select-none ${className}`}
            style={{
                fontFamily,
                // Set the base font-size on the container. The side letters will inherit this.
                fontSize: `${fontSize}px`,
                // The `gap` property is the best way to create consistent space between letters.
                gap: letterSpacing,
                ...style
            }}
        >
            {/* This span inherits its font size from the parent div */}
            <span>{first}</span>

            {/* This span overrides the font size to be larger */}
            <span style={{ fontSize: `${middleFontSize}px` }}>
                {middle}
            </span>

            {/* This span also inherits its font size from the parent div */}
            <span>{last}</span>
        </div>
    );
}