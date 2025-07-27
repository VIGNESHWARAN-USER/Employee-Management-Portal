// src/components/CustomModal.js

import React from 'react';
import { X } from 'lucide-react';

const CustomModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    // This function handles clicks on the backdrop, but not on the modal content itself.
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        // Main overlay
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300"
        >
            {/* Modal Dialog */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl m-4 transform transition-all duration-300 animate-fade-in-up">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};



export default CustomModal;