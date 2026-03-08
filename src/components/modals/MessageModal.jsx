const MessageModal = ({ message, onClose }) => (
    <div className="text-center">
        <p className="text-slate-800 text-lg mb-8">{message}</p>
        <button onClick={onClose} className="px-12 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm text-base">OK</button>
    </div>
);

export default MessageModal;
