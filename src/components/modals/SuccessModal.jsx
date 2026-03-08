const SuccessModal = ({ onClose }) => (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto">
        <img src="/images/Arch Vector Logo.svg" alt="Arch Engraving Logo" className="h-95 w-95 mb-6" />
        <h3 className="text-3xl font-bold text-slate-800 mb-2">Submission Successful!</h3>
        <p className="text-lg text-slate-600 mb-8">We Appreciate Your Business!</p>
        <button
            onClick={onClose}
            className="px-12 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm text-base"
        >
            Done
        </button>
    </div>
);

export default SuccessModal;
