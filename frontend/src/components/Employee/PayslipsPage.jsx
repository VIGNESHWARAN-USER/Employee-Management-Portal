import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FileText, Calendar, Filter, X, Landmark, TrendingUp, Banknote, Wallet } from 'lucide-react';

// --- Assuming these components are in the correct path ---
import CustomModal from './CustomModal'; 
import PayslipDetailView from './PayslipDetailView';

// --- DATA TRANSFORMATION LOGIC ---
// This function maps your API response to the format our UI components expect.
const transformPayslipData = (apiPayslip) => {
    // A safeguard in case salary or user is null
    if (!apiPayslip.salary || !apiPayslip.user) {
        console.error("Malformed payslip data received:", apiPayslip);
        return null; // Return null to filter this out later
    }
    const totalDeductions = (apiPayslip.salary.providentFund || 0) + (apiPayslip.salary.professionalTax || 0);
    return {
        id: apiPayslip.id,
        payPeriod: `${apiPayslip.month} ${apiPayslip.year}`,
        payDate: apiPayslip.generatedOn,
        netPay: apiPayslip.salary.netSalary,
        status: "Paid",
        employeeId: apiPayslip.user.id,
        employeeName: `${apiPayslip.user.firstName} ${apiPayslip.user.lastName}`,
        role: apiPayslip.user.role,
        grossEarnings: apiPayslip.salary.grossEarnings,
        totalDeductions: totalDeductions,
        earnings: [
            { type: 'Basic Salary', amount: apiPayslip.salary.basic || 0 },
            { type: 'House Rent Allowance (HRA)', amount: apiPayslip.salary.hra || 0 },
            { type: 'Special Allowance', amount: apiPayslip.salary.specialAllowance || 0 },
        ].filter(e => e.amount > 0), // Only show earnings with a value
        deductions: [
            { type: 'Provident Fund (PF)', amount: apiPayslip.salary.providentFund || 0 },
            { type: 'Professional Tax', amount: apiPayslip.salary.professionalTax || 0 },
        ].filter(d => d.amount > 0), // Only show deductions with a value
    };
};

// --- HELPER FUNCTION FOR FILTERS ---
// Updated to work with the data structure { month: "July", year: 2025 }
const getMonthOptions = (apiPayslips) => {
    const monthMap = { "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12 };
    const months = apiPayslips.map(p => {
        const monthNumber = String(monthMap[p.month]).padStart(2, '0');
        return {
            value: `${p.year}-${monthNumber}`, // e.g., "2025-07"
            label: `${p.month} ${p.year}`
        };
    });
    // Remove duplicates
    return [...new Map(months.map(item => [item['value'], item])).values()];
};

// --- NEW HELPER COMPONENTS FOR IMPROVED UI ---
const SummaryCard = ({ icon, title, value, color }) => (
    <div className={`p-6 rounded-2xl shadow-lg text-white bg-gradient-to-br ${color}`}>
        <div className="flex items-center gap-4 mb-2">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-4xl font-bold tracking-tight">{value}</p>
    </div>
);

const PayslipListItem = ({ payslip, onView }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md hover:border-sky-300 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
                <div className="bg-sky-100 text-sky-600 p-4 rounded-full">
                    <Wallet size={24} />
                </div>
                <div>
                    <p className="font-semibold text-lg text-slate-800">{payslip.payPeriod}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                        <Calendar size={14} /> Generated on {new Date(payslip.payDate).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6">
                <div className="text-right">
                    <p className="text-sm text-slate-500">Net Pay</p>
                    <p className="font-bold text-xl text-emerald-600">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payslip.netPay)}
                    </p>
                </div>
                <button 
                    onClick={() => onView(payslip)} 
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                    View
                </button>
            </div>
        </div>
    </div>
);


// --- MAIN COMPONENT ---
const PayslipsPage = () => {
    const [rawPayslips, setRawPayslips] = useState([]);
    const [uiPayslips, setUiPayslips] = useState([]);
    const [filteredPayslips, setFilteredPayslips] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    // Fetch data from your actual endpoint
    useEffect(() => {
        const fetchPayslips = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8080/api/fetchAllPayslips`);
                
                setRawPayslips(response.data);
                
                // Transform data and filter out any null results from malformed data
                const transformedData = response.data.map(transformPayslipData).filter(Boolean);
                setUiPayslips(transformedData);
                setFilteredPayslips(transformedData);

            } catch (err) {
                setError("Failed to fetch payslips. Please try again later.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayslips();
    }, []);

    // Effect to apply filter when selectedMonth changes
    useEffect(() => {
        if (!selectedMonth) {
            setFilteredPayslips(uiPayslips);
        } else {
            const [year, month] = selectedMonth.split('-').map(Number);
            const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

            const filtered = uiPayslips.filter(p => {
                const [pMonth, pYear] = p.payPeriod.split(' ');
                return pMonth === monthName && Number(pYear) === year;
            });
            setFilteredPayslips(filtered);
        }
    }, [selectedMonth, uiPayslips]);

    // Calculate summary data using useMemo for efficiency
    const summaryData = useMemo(() => {
        if (uiPayslips.length === 0) {
            return { ytd: 0, avg: 0, last: 0 };
        }
        // Assuming payslips are sorted newest to oldest from API
        const ytd = uiPayslips.reduce((acc, p) => acc + p.netPay, 0);
        const avg = ytd / uiPayslips.length;
        const last = uiPayslips[0]?.netPay || 0;
        return { ytd, avg, last };
    }, [uiPayslips]);

    const handleViewPayslip = (payslip) => {
        setSelectedPayslip(payslip);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPayslip(null);
    };

    const monthOptions = getMonthOptions(rawPayslips);

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">My Payslips</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <SummaryCard 
                        icon={<TrendingUp size={24}/>} 
                        title="Year-to-Date Earnings" 
                        value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summaryData.ytd)} 
                        color="from-emerald-500 to-emerald-600"
                    />
                    <SummaryCard 
                        icon={<Banknote size={24}/>} 
                        title="Average Monthly Pay" 
                        value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summaryData.avg)}
                        color="from-sky-500 to-sky-600"
                    />
                    <SummaryCard 
                        icon={<Landmark size={24}/>} 
                        title="Last Net Pay" 
                        value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summaryData.last)} 
                        color="from-indigo-500 to-indigo-600"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                        <h2 className="text-xl font-semibold text-slate-800 flex items-center flex-grow">
                            <FileText className="mr-3 h-6 w-6 text-sky-500" />Pay History
                        </h2>
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-500" />
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
                                <option value="">All Months</option>
                                {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            {selectedMonth && <button onClick={() => setSelectedMonth('')} className="p-2 text-slate-500 hover:text-slate-800"><X size={20}/></button>}
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {isLoading ? <p className="text-center py-8 text-slate-500">Loading payslips...</p> : error ? <p className="text-center text-red-500 py-8">{error}</p> : filteredPayslips.length > 0 ? (
                            <div className="space-y-4">
                                {filteredPayslips.map(payslip => (
                                    <PayslipListItem key={payslip.id} payslip={payslip} onView={handleViewPayslip} />
                                ))}
                            </div>
                        ) : <p className="text-center text-slate-500 py-8">No payslips found for the selected period.</p>}
                    </div>
                </div>
            </div>

            <CustomModal isOpen={isModalOpen} onClose={handleCloseModal} title={`Payslip for ${selectedPayslip?.payPeriod}`}>
                <PayslipDetailView payslip={selectedPayslip} />
            </CustomModal>
        </div>
    );
};

export default PayslipsPage;