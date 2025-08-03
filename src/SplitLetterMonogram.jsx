import React from 'react';

/**
 * Renders a split-letter monogram SVG.
 * The large initial is used as a mask, a bar is drawn over it,
 * and the name is rendered on top of the bar.
 */
const SplitLetterMonogram = ({
    initial = 'S',
    name = 'NAME',
    fontFamily = 'Times New Roman',
    nameFontFamily, // Optional: for a different name font
    initialColor = 'black',
    nameColor = 'black',
    barColor = 'white'
}) => {
    // Use a unique ID for the clipPath to avoid conflicts if multiple are on the page
    const clipPathId = `split-letter-clip-${React.useId()}`;

    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* 1. Define the letter shape that will be used as a clipping mask. */}
            <defs>
                <clipPath id={clipPathId}>
                    <text
                        x="50"
                        y="52" // Y-position adjusted for better visual centering
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontSize="90"
                        fontFamily={fontFamily}
                        fontWeight="bold"
                    >
                        {initial}
                    </text>
                </clipPath>
            </defs>

            {/* 2. Create a rectangle and apply the clip-path to it. 
           This makes the letter shape solid and colored. */}
            <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill={initialColor}
                clipPath={`url(#${clipPathId})`}
            />

            {/* 3. Draw a rectangle over the top to create the "split" effect.
           This bar is typically the same color as the background. */}
            <rect
                x="0"
                y="42.5" // Vertical position of the split bar
                width="100"
                height="15" // Height of the split bar
                fill={barColor}
            />

            {/* 4. Render the name text on top of the split bar. */}
            <text
                x="50"
                y="51" // Y-position adjusted for the name
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="12"
                // UPDATE: Use the main font family for the name as a fallback
                fontFamily={nameFontFamily || fontFamily}
                fill={nameColor}
                letterSpacing="0.1em"
                style={{ textTransform: 'uppercase' }}
            >
                {name}
            </text>
        </svg>
    );
};

export default SplitLetterMonogram;
