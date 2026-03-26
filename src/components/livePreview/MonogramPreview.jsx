import React from 'react';

const MonogramPreview = ({ htmlString }) => {
    if (!htmlString) return null;

    return (
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-200/85 bg-[linear-gradient(180deg,rgba(247,249,252,0.96),rgba(239,244,248,0.9))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_34px_-28px_rgba(51,65,85,0.14)]">
            <div className="flex h-[220px] items-center justify-center rounded-[1.2rem] border border-white/80 bg-white/75 p-4">
                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: htmlString }} />
            </div>
        </div>
    );
};

export default MonogramPreview;
