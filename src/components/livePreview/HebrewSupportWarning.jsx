import React from 'react';

const HebrewSupportWarning = () => (
    <div
        className="rounded-[1.2rem] border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(254,243,199,0.78))] p-4 shadow-[0_12px_24px_-22px_rgba(180,83,9,0.28)]"
        role="alert"
    >
        <div className="flex gap-3">
            <div className="flex-shrink-0 pt-0.5">
                <svg
                    className="h-5 w-5 text-amber-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>

            <div>
                <p className="text-sm font-semibold text-amber-900">
                    Hebrew character support can vary between fonts.
                </p>
                <p className="mt-1 text-sm text-amber-800/90">
                    Check each preview carefully before submitting your selection.
                </p>
            </div>
        </div>
    </div>
);

export default HebrewSupportWarning;
