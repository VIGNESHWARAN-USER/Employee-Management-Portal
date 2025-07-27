import React from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, actionType }) => {
    if (!isOpen) {
        return null;
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const confirmButtonStyles = {
        approve: "bg-green-600 hover:bg-green-700",
        reject: "bg-red-600 hover:bg-red-700",
        default: "bg-sky-600 hover:bg-sky-700"
    }

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 animate-fade-in"
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all duration-300 animate-fade-in-up">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                         {actionType === 'reject' && <AlertTriangle className="text-red-500" size={24}/>}
                        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>

                <div className="flex justify-end gap-4 p-4 bg-slate-50 rounded-b-2xl">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className={`px-5 py-2 text-white rounded-lg flex items-center gap-2 transition-colors ${confirmButtonStyles[actionType] || confirmButtonStyles.default }`}>
                        <Check size={16} /> Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;