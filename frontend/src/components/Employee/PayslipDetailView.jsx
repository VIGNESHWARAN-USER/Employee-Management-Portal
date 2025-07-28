// src/components/PayslipDetailView.js

import React from 'react';
import { Download } from 'lucide-react';

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const PayslipDetailView = ({ payslip }) => {
    if (!payslip) return null;

    return (
        <div className="p-2 sm:p-4 border rounded-lg bg-slate-50">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">XYZ Pvt. Ltd.</h2>
                <p className="text-slate-500">Pay Statement for {payslip.payPeriod}</p>
            </div>

            {/* Employee Details */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 text-sm">
                <div>
                    <p className="font-bold">{payslip.employeeName}</p>
                    <p className="text-slate-600">{payslip.role}</p>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                    <p><span className="font-semibold">Pay Date:</span> {new Date(payslip.payDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Employee ID:</span> {payslip.employeeId}</p>
                </div>
            </div>

            {/* Earnings and Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-green-700 border-b-2 border-green-200 pb-2 mb-3">Earnings</h3>
                    <div className="space-y-2">
                        {payslip.earnings.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-slate-600">{item.type}</span>
                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-red-700 border-b-2 border-red-200 pb-2 mb-3">Deductions</h3>
                    <div className="space-y-2">
                        {payslip.deductions.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-slate-600">{item.type}</span>
                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2"><span className="font-semibold text-slate-600">Gross Earnings:</span><span className="font-bold text-lg text-green-700">{formatCurrency(payslip.grossEarnings)}</span></div>
                <div className="flex justify-between items-center mb-3"><span className="font-semibold text-slate-600">Total Deductions:</span><span className="font-bold text-lg text-red-700">{formatCurrency(payslip.totalDeductions)}</span></div>
                <hr />
                <div className="flex justify-between items-center mt-3"><span className="font-bold text-xl text-slate-800">Net Pay:</span><span className="font-extrabold text-2xl text-slate-900">{formatCurrency(payslip.netPay)}</span></div>
            </div>
            
            {/* Action Footer for the Modal */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Close</button>
            </div>
        </div>
    );
};

export default PayslipDetailView;