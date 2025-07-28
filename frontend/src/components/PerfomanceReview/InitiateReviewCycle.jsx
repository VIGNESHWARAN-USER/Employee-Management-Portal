import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Rocket, User, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const InitiateReviewCycle = () => {
    // State for all employees fetched from the backend
    const [employees, setEmployees] = useState([]);
    // State to track which employee IDs are checked
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    // State for the date inputs
    const [reviewPeriodStart, setReviewPeriodStart] = useState('');
    const [reviewPeriodEnd, setReviewPeriodEnd] = useState('');
    // State for UI feedback
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch all employees when the component mounts
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // This endpoint should return a list of all employees
                const response = await axios.get('http://localhost:8080/api/fetchAllUsers');
                setEmployees(response.data);
            } catch (err) {
                setError('Failed to fetch employee list.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    // Handler for the "Select All" checkbox
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedEmployees(employees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    // Handler for individual employee checkboxes
    const handleSelectOne = (e, employeeId) => {
        if (e.target.checked) {
            setSelectedEmployees(prev => [...prev, employeeId]);
        } else {
            setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
        }
    };

    // Main submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // 1. Validation
        if (!reviewPeriodStart || !reviewPeriodEnd) {
            setError('Please select both a start and end date for the review period.');
            return;
        }
        if (new Date(reviewPeriodEnd) < new Date(reviewPeriodStart)) {
            setError('The end date cannot be before the start date.');
            return;
        }
        if (selectedEmployees.length === 0) {
            setError('Please select at least one employee for the review cycle.');
            return;
        }

        // 2. Confirmation
        const isConfirmed = window.confirm(
            `You are about to start a new review cycle for ${selectedEmployees.length} employees.\n` +
            `Period: ${reviewPeriodStart} to ${reviewPeriodEnd}\n\n` +
            `Are you sure you want to proceed? This action cannot be undone.`
        );

        if (!isConfirmed) {
            return;
        }

        // 3. API Call
        try {
            const payload = {
                reviewPeriodStart,
                reviewPeriodEnd,
                employeeIds: selectedEmployees,
            };
            console.log(payload);
            const response = await axios.post('http://localhost:8080/api/reviews/start-cycle', payload);
            setSuccessMessage(response.data.message || 'Review cycle initiated successfully!');
            // Clear selections after successful launch
            setSelectedEmployees([]);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while launching the cycle.');
            console.error(err);
        }
    };

    if (loading) return <div className="text-center p-8">Loading Employee Data...</div>;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <Rocket className="text-sky-500" />
                Initiate New Performance Review Cycle
            </h2>
            <p className="text-slate-500 mb-6">Select a time period and choose which employees to include in this review cycle.</p>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Dates */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
                    <h3 className="font-semibold text-slate-700 mb-3 text-lg">Step 1: Define Review Period</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Period Start Date</label>
                            <input type="date" id="startDate" value={reviewPeriodStart} onChange={e => setReviewPeriodStart(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Period End Date</label>
                            <input type="date" id="endDate" value={reviewPeriodEnd} onChange={e => setReviewPeriodEnd(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Step 2: Employee Selection */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
                    <h3 className="font-semibold text-slate-700 mb-3 text-lg">Step 2: Select Employees ({selectedEmployees.length} selected)</h3>
                     <div className="overflow-y-auto max-h-96 border rounded-lg">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-200 sticky top-0">
                                <tr>
                                    <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedEmployees.length === employees.length && employees.length > 0} /></th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Employee ID</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Employee Name</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Role</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Email ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-sky-50">
                                        <td className="p-4"><input type="checkbox" checked={selectedEmployees.includes(emp.id)} onChange={e => handleSelectOne(e, emp.id)} /></td>
                                        <td className="p-4 font-medium">{emp.id}</td>
                                        <td className="p-4 font-medium">{emp.firstName+" "+emp.lastName}</td>
                                        <td className="p-4 text-slate-600">{emp.role}</td>
                                        <td className="p-4 text-slate-600">{emp.officialEmail || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Messages and Submission */}
                {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2"><AlertTriangle size={20}/> {error}</div>}
                {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2"><CheckCircle size={20}/> {successMessage}</div>}

                <div className="flex justify-end pt-4 border-t">
                    <button type="submit" className="px-8 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 flex items-center gap-2 transition-all shadow-md">
                        <Rocket size={18} /> Launch Review Cycle
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InitiateReviewCycle;