import React from 'react';

const MonogramPreview = ({ htmlString }) => {
    if (!htmlString) return null;

    return (
        <div className="overflow-hidden rounded-[1.6rem] border border-blue-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.82))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_34px_-28px_rgba(37,99,235,0.24)]">
            <div className="flex h-[220px] items-center justify-center rounded-[1.2rem] border border-white/70 bg-white/55 p-4">
                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: htmlString }} />
            </div>
        </div>
    );
};

export default MonogramPreview;
