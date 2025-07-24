// Salary & Payroll UI - React + Tailwind + Lucide + Sonner (Static Data Only)

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Download, DollarSign, FileText, CalendarDays } from 'lucide-react';

const SalaryPayroll = () => {
  const [payslips] = useState([
    {
      payslip_id: 1,
      employee_name: 'Arun Kumar',
      net_salary: 52000,
      month: 'July',
      year: 2025,
      generated_on: '2025-07-20'
    },
    {
      payslip_id: 2,
      employee_name: 'Meena Raj',
      net_salary: 61000,
      month: 'July',
      year: 2025,
      generated_on: '2025-07-21'
    },
    {
      payslip_id: 3,
      employee_name: 'Vigneshwaran M',
      net_salary: 58000,
      month: 'July',
      year: 2025,
      generated_on: '2025-07-19'
    },
  ]);

  const downloadPDF = (id) => {
    toast.success(`Payslip #${id} download triggered`);
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-3xl font-semibold mb-8 flex items-center gap-2 text-green-700">
        <DollarSign className="w-6 h-6" /> Payroll Overview
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {payslips.map((payslip) => (
          <div
            key={payslip.payslip_id}
            className="bg-gradient-to-br from-white via-gray-50 to-green-50 rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800">{payslip.employee_name}</h2>
              <span className="text-sm bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full">
                ₹ {payslip.net_salary.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-500 gap-2 mb-1">
              <CalendarDays className="w-4 h-4" /> {payslip.month}, {payslip.year}
            </div>
            <div className="text-xs text-gray-400 mb-4">
              Generated on: {new Date(payslip.generated_on).toLocaleDateString()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => downloadPDF(payslip.payslip_id)}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={() => toast.info('Preview feature coming soon')}
                className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100"
              >
                <FileText size={16} /> View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalaryPayroll;
