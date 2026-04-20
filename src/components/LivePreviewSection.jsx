import PreviewCanvas from './livePreview/PreviewCanvas';
import PreviewLayoutControls from './livePreview/PreviewLayoutControls';

const HebrewSupportWarning = () => (
    <div className="rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4">
        <div className="flex">
            <div className="flex-shrink-0">
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
            <div className="ml-3">
                <p className="text-sm font-medium text-amber-800">
                    Please check each preview carefully as Hebrew character support can vary between fonts.
                </p>
            </div>
        </div>
    </div>
);

const LivePreviewSection = ({
    AlignIcon,
    customText,
    fontSize,
    getDefaultStyleKey,
    getFontOptionByName,
    hebrewRegex,
    lineSpacing,
    monogramInfo,
    onFontSizeChange,
    onLineSelect,
    onLineSpacingChange,
    onTextAlignChange,
    previewLines,
    selectedPreviewLineIndex,
    textAlign,
}) => (
    <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h2
                    className="text-3xl font-bold tracking-normal text-slate-900"
                    style={{ fontFamily: 'Alumni Sans Regular' }}
                >
                    Live Preview
                </h2>
                <p className="mt-1 text-slate-500">
                    Preview your text in a single layout. Select a line to mark it for future line-specific adjustments.
                </p>
            </div>
        </div>

        <div className="space-y-5 rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-slate-200 p-6">
            <PreviewLayoutControls
                AlignIcon={AlignIcon}
                fontSize={fontSize}
                lineSpacing={lineSpacing}
                onFontSizeChange={onFontSizeChange}
                onLineSpacingChange={onLineSpacingChange}
                onTextAlignChange={onTextAlignChange}
                textAlign={textAlign}
            />

            {monogramInfo && (
                <div className="flex h-[200px] items-center justify-center rounded-xl border border-blue-200 bg-blue-50 p-6 shadow">
                    <div
                        className="h-full w-full"
                        dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }}
                    />
                </div>
            )}

            {hebrewRegex.test(customText) && <HebrewSupportWarning />}

            <PreviewCanvas
                fontSize={fontSize}
                getDefaultStyleKey={getDefaultStyleKey}
                getFontOptionByName={getFontOptionByName}
                lineSpacing={lineSpacing}
                lines={previewLines}
                onLineSelect={onLineSelect}
                selectedPreviewLineIndex={selectedPreviewLineIndex}
                textAlign={textAlign}
            />
        </div>
    </section>
);

export default LivePreviewSection;
