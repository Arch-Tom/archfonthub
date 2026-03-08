const FormInput = ({ label, id, value, onChange, required = false, isOptional = false, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {isOptional && <span className="text-slate-500 text-xs ml-1">(Optional)</span>}
        </label>
        <input
            id={id}
            type="text"
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-base ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-300'}`}
        />
    </div>
);

const CustomerInfoModal = ({
    onSubmit,
    orderNumber,
    onOrderNumberChange,
    customerName,
    onCustomerNameChange,
    customerCompany,
    onCustomerCompanyChange,
    isDataPrefilled,
    isSubmitting,
    onCancel,
}) => (
    <form onSubmit={onSubmit} className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-900">Enter Customer Information to Save</h3>
        <FormInput label="Order Number" id="orderNumber" value={orderNumber} onChange={onOrderNumberChange} required disabled={isDataPrefilled || isSubmitting} />
        <FormInput label="Customer Name" id="customerName" value={customerName} onChange={onCustomerNameChange} required disabled={isDataPrefilled || isSubmitting} />
        <FormInput label="Customer Company" id="customerCompany" value={customerCompany} onChange={onCustomerCompanyChange} isOptional disabled={isDataPrefilled || isSubmitting} />
        <div className="flex justify-end gap-4 pt-4">
            <button type="button" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm text-base disabled:opacity-75 disabled:cursor-not-allowed" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit & Save'}
            </button>
        </div>
    </form>
);

export default CustomerInfoModal;
