import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { FaCalculator, FaRegSave } from 'react-icons/fa';
import { HiOutlineUserCircle } from "react-icons/hi";
import { toast } from 'sonner';



// --- Helper to format currency ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};


const SalarySetup = () => {
    // --- State Management ---
    const [employees, setEmployees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    // This will hold the breakdown values from the form
    const [breakdown, setBreakdown] = useState({
        basic: 0,
        hra: 0,
        professionalTax: 200, // Common fixed value, can be made dynamic
    });

    // --- Data Fetching ---
    useEffect(() => {
        setIsFetching(true);
        
        const fetchPromise = axios.get("http://localhost:8080/api/fetchAllUsers");

        toast.promise(fetchPromise, {
            loading: 'Fetching eligible employees...',
            success: (response) => {
                console.log(response.data)
                setEmployees(response.data);
                setIsFetching(false);
                return 'Employees loaded successfully!';
            },
            error: () => {
                setIsFetching(false);
                return 'Failed to fetch employees.';
            },
        });
         const fetchPromise1 = axios.get("http://localhost:8080/api/fetchAllSalaryStructures");

        toast.promise(fetchPromise1, {
            loading: 'Fetching salaries of employees...',
            success: (response) => {
                console.log(response.data)
                setSalaries(response.data);
                setIsFetching(false);
                return 'Salaries loaded successfully!';
            },
            error: () => {
                setIsFetching(false);
                return 'Failed to fetch salaries.';
            },
        });
    }, []);

    // --- Derived State and Calculations using useMemo for efficiency ---
    const selectedEmployeeData = useMemo(() => {
        return employees?.find(emp => emp.id === parseInt(selectedEmployeeId));
    }, [selectedEmployeeId, employees]);

    const calculations = useMemo(() => {
        const ctc = selectedEmployeeData?.salary || 0;
        const monthlyCTC = ctc / 12;

        const basic = parseFloat(breakdown.basic) || 0;
        const hra = parseFloat(breakdown.hra) || 0;

        // Standard PF is 12% of Basic Salary
        const employeePF = basic * 0.12;
        const employerPF = basic * 0.12; // Employer's contribution is also part of CTC

        // Special Allowance is the balancing amount to match the CTC
        const specialAllowance = monthlyCTC - basic - hra - employerPF;
        
        const grossEarnings = basic + hra + (specialAllowance > 0 ? specialAllowance : 0);
        
        const professionalTax = parseFloat(breakdown.professionalTax) || 0;
        const totalDeductions = employeePF + professionalTax;
        
        const netSalary = grossEarnings - totalDeductions;
        
        return {
            ctc,
            monthlyCTC,
            basic,
            hra,
            employeePF,
            employerPF,
            specialAllowance,
            grossEarnings,
            totalDeductions,
            netSalary,
        };
    }, [selectedEmployeeData, breakdown]);

    // --- Event Handlers ---
    const handleEmployeeSelect = (e) => {
        const empId = e.target.value;
        setSelectedEmployeeId(empId);

        if (empId) {
            const employee = employees?.find(emp => emp.id === parseInt(empId));
            const salary = salaries?.find(emp => emp.employee.id === parseInt(empId));
            console.log(salary.basic)
            if(salaries && employee)
            {
                setBreakdown({
                    basic: salary.basic,
                    hra: salary.hra,
                    professionalTax: salary.professionalTax,
                });
            }
            else if (employee) {
                const monthlyCTC = employee.salary / 12;
                const defaultBasic = monthlyCTC * 0.4;
                const defaultHRA = defaultBasic * 0.4; // HRA as 40% of Basic

                setBreakdown({
                    basic: defaultBasic.toFixed(2),
                    hra: defaultHRA.toFixed(2),
                    professionalTax: 200,
                });
            }
        } else {
            // Reset if no employee is selected
            setBreakdown({ basic: 0, hra: 0, professionalTax: 200 });
        }
    };

    const handleBreakdownChange = (e) => {
        const { name, value } = e.target;
        setBreakdown(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (calculations.specialAllowance < 0) {
            toast.error("Validation Error", {
                description: "Basic + HRA + Employer PF exceeds the monthly CTC. Please adjust the values.",
            });
            return;
        }

        // In a real app, you would send this data to your backend
        const payload = {
            employee: selectedEmployeeData.id,
            ...breakdown,
            specialAllowance: calculations.specialAllowance,
            grossEarnings: calculations.grossEarnings,
            netSalary: calculations.netSalary,
        };
        console.log(payload)
        //const savePromise = new Promise(resolve => setTimeout(() => resolve({ data: "Salary structure saved!" }), 1500));
        const savePromise  = axios.post("http://localhost:8080/api/submitStructure", payload)
        toast.promise(savePromise, {
            loading: `Saving salary structure for ${selectedEmployeeData.firstName}...`,
            success: (response) => {
                console.log("Payload to send to backend:", payload);
                return response.data;
            },
            error: "Failed to save the structure."
        });
    };

    return (
        <div className="w-full h-full p-4 md:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Salary Setup</h1>
                
                {/* --- Step 1: Employee Selection --- */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <label htmlFor="employee-select" className="block text-lg font-semibold text-gray-700 mb-2">Select Employee</label>
                    <select
                        id="employee-select"
                        value={selectedEmployeeId}
                        onChange={handleEmployeeSelect}
                        disabled={isFetching}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{isFetching ? 'Loading employees...' : '-- Choose an employee --'}</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} (CTC: {formatCurrency(emp.salary / 12)}/month)
                            </option>
                        ))}
                    </select>
                </div>

                {/* --- Step 2: Salary Breakdown & Summary (Show only if an employee is selected) --- */}
                {selectedEmployeeData && (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* --- Left Side: Breakdown Form --- */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                                    <HiOutlineUserCircle className="text-blue-500" size={40} />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedEmployeeData.firstName} {selectedEmployeeData.lastName}</h2>
                                        <p className="text-md text-gray-600">Annual CTC: <span className="font-semibold">{formatCurrency(selectedEmployeeData.salary)}</span></p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Earnings */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                                                <input type="number" name="basic" value={breakdown.basic} onChange={handleBreakdownChange} className="mt-1 w-full p-2 border rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">House Rent Allowance (HRA)</label>
                                                <input type="number" name="hra" value={breakdown.hra} onChange={handleBreakdownChange} className="mt-1 w-full p-2 border rounded-md" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-500">Special Allowance (Calculated)</label>
                                                <input type="text" value={formatCurrency(calculations.specialAllowance)} readOnly className="mt-1 w-full p-2 border bg-gray-100 rounded-md" />
                                                {calculations.specialAllowance < 0 && <p className='text-red-500 text-xs mt-1'>Warning: This value is negative. Reduce Basic or HRA.</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                     <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Deductions</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div>
                                                <label className="block text-sm font-medium text-gray-500">Provident Fund (12% of Basic)</label>
                                                <input type="text" value={formatCurrency(calculations.employeePF)} readOnly className="mt-1 w-full p-2 border bg-gray-100 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Professional Tax</label>
                                                <input type="number" name="professionalTax" value={breakdown.professionalTax} onChange={handleBreakdownChange} className="mt-1 w-full p-2 border rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* --- Right Side: Summary Card --- */}
                            <div className="lg:col-span-1 bg-blue-600 text-white p-8 rounded-xl shadow-lg flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <FaCalculator size={28}/>
                                    <h2 className="text-2xl font-bold">Salary Summary</h2>
                                </div>
                                <div className="space-y-5 flex-grow">
                                    <div className="flex justify-between items-center">
                                        <p className="opacity-80">Monthly CTC</p>
                                        <p className="font-bold text-lg">{formatCurrency(calculations.monthlyCTC)}</p>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                                        <p className="font-semibold">Gross Monthly Earnings</p>
                                        <p className="font-bold text-lg">{formatCurrency(calculations.grossEarnings)}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="opacity-80">Total Monthly Deductions</p>
                                        <p className="font-bold text-lg text-red-300">-{formatCurrency(calculations.totalDeductions)}</p>
                                    </div>
                                    <div className="border-t-2 border-dashed border-white/30 my-4"></div>
                                    <div className="bg-white text-blue-700 p-4 rounded-lg text-center">
                                        <p className="font-bold text-lg">Net Monthly Salary</p>
                                        <p className="font-extrabold text-3xl tracking-tight">{formatCurrency(calculations.netSalary)}</p>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full mt-8 py-3 px-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                                >
                                    <FaRegSave className="mr-2" />
                                    Save & Move to Payroll
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SalarySetup;