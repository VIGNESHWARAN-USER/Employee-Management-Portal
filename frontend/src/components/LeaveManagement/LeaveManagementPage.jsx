import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomModal from '../Employee/CustomModal'; // Ensure this path is correct
import { CalendarDays, Plane, HeartPulse, MoreHorizontal, FilePlus, Send, CircleHelp, CircleX, CircleCheck } from 'lucide-react';

// --- Helper Components for UI (No changes here) ---
const LeaveBalanceCard = ({ icon, title, balance, bgColor }) => (
    <div className={`p-6 rounded-2xl shadow-sm text-white ${bgColor}`}>
        <div className="flex items-center gap-4 mb-4">
            {icon}
            <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <div className="text-center">
            <p className="text-4xl font-bold">{balance.remaining}</p>
            <p className="text-sm opacity-80">Remaining</p>
        </div>
        <div className="flex justify-between text-xs mt-4 pt-4 border-t border-white/20">
            <span>Total: {balance.total}</span>
            <span>Taken: {balance.taken}</span>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
        APPROVED: 'bg-green-100 text-green-800 ring-green-600/20',
        REJECTED: 'bg-red-100 text-red-800 ring-red-600/20',
        CANCELLED: 'bg-gray-100 text-gray-800 ring-gray-600/20',
    };
    const icons = {
        PENDING: <CircleHelp size={16} />,
        APPROVED: <CircleCheck size={16} />,
        REJECTED: <CircleX size={16} />,
        CANCELLED: <CircleX size={16}/>,
    }
    const statusKey = status.toUpperCase();
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${styles[statusKey]}`}>
            {icons[statusKey]} {status}
        </span>
    );
};


// --- Main Leave Management Component ---
const LeaveManagementPage = () => {
    // State for UI data
    const [leaveBalances, setLeaveBalances] = useState({
        casual: { total: 12, taken: 0, remaining: 12 },
        sick: { total: 10, taken: 0, remaining: 10 },
        earned: { total: 18, taken: 0, remaining: 18 },
    });
    const [leaveHistory, setLeaveHistory] = useState([]); // Start with an empty array
    
    // State for the modal and form inputs
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leaveType, setLeaveType] = useState('CASUAL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [formError, setFormError] = useState('');


    // --- CORRECTED: Fetch real data and calculate balances from backend ---
    useEffect(() => {
        // Helper function to calculate the number of days between two dates (inclusive)
        const getDaysBetween = (startDate, endDate) => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start) || isNaN(end)) return 0; // Invalid date check
            // Add 1 to make the end date inclusive
            const timeDiff = end.getTime() - start.getTime();
            return Math.round(timeDiff / (1000 * 3600 * 24)) + 1;
        };

        const fetchLeaveData = async () => {
            try {
                const userData = localStorage.getItem("userData");
                if (!userData) {
                    console.error("User data not found in localStorage.");
                    return;
                }
                const employeeId = JSON.parse(userData)?.id;
                if (!employeeId) {
                    console.error("Employee ID not found.");
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/leaves/history/${employeeId}`);
                const history = response.data;
                setLeaveHistory(history);

                // --- Correctly Calculate and Update Balances ---
                // 1. Start with a fresh balance object based on totals
                const newBalances = {
                    casual: { total: 12, taken: 0, remaining: 12 },
                    sick: { total: 10, taken: 0, remaining: 10 },
                    earned: { total: 18, taken: 0, remaining: 18 },
                };

                // 2. Iterate over APPROVED leaves to calculate total days taken
                history.forEach(leave => {
                    if (leave.status === 'APPROVED') {
                        const daysTaken = getDaysBetween(leave.startDate, leave.endDate);
                        const typeKey = leave.leaveType.toLowerCase();
                        
                        if (newBalances[typeKey]) {
                            newBalances[typeKey].taken += daysTaken;
                        }
                    }
                });

                // 3. Calculate the remaining days for each leave type
                for (const key in newBalances) {
                    newBalances[key].remaining = newBalances[key].total - newBalances[key].taken;
                }
                
                // 4. Update the state once with the newly calculated object
                setLeaveBalances(newBalances);

            } catch (error) {
                console.error("Failed to fetch leave data:", error);
                // Optionally set an error state to show in the UI
            }
        };

        fetchLeaveData();
    }, []); // The empty dependency array ensures this runs only once on mount


    const resetForm = () => {
        setLeaveType('CASUAL');
        setStartDate('');
        setEndDate('');
        setReason('');
        setAttachment(null);
        setFormError('');
    };
    
    const handleApplyClick = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleCancel = async (e, leave) => {
        e.preventDefault();
        try {
            // NOTE: Ensure your backend knows how to handle this payload
            const payload = { ...leave, employee_id: JSON.parse(localStorage.getItem("userData")).id };
            const resp = await axios.post("http://localhost:8080/api/cancelLeave", payload);
            
            // To see the change immediately, we should update the state
            // It's often best if the API returns the updated list or the updated single item
            setLeaveHistory(prevHistory => 
                prevHistory.map(item => 
                    item.id === leave.id ? { ...item, status: 'CANCELLED' } : item
                )
            );
        } catch (e) {
            console.error("Failed to cancel leave:", e);
        }
    }

    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!leaveType || !startDate || !endDate || !reason) {
            setFormError("All fields except attachment are required.");
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            setFormError("End date cannot be before the start date.");
            return;
        }
        if (new Date(startDate) < new Date().setHours(0, 0, 0, 0)) {
            setFormError("Start date cannot be in the past.");
            return;
        }
        
        const employeeId = JSON.parse(localStorage.getItem("userData"))?.id;
        if (!employeeId) {
            setFormError("Could not identify employee. Please log in again.");
            return;
        }

        const formData = new FormData();
        formData.append('employeeId', employeeId);
        formData.append('leaveType', leaveType);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('reason', reason);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            const response = await axios.post('http://localhost:8080/api/leaves/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("Leave request submitted successfully:", response.data);
            alert("Your leave request has been submitted!");
            
            setLeaveHistory(prevHistory => [response.data, ...prevHistory]);
            setIsModalOpen(false);

        } catch (error) {
            console.error("Failed to submit leave request:", error);
            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
            setFormError(errorMessage);
        }
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
                    <button onClick={handleApplyClick} className="mt-4 sm:mt-0 flex items-center gap-2 bg-sky-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-sky-700 transition-all"><FilePlus size={20} /> Apply for Leave</button>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">My Leave Balances</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <LeaveBalanceCard icon={<Plane size={24}/>} title="Casual Leave" balance={leaveBalances.casual} bgColor="bg-blue-500" />
                        <LeaveBalanceCard icon={<HeartPulse size={24}/>} title="Sick Leave" balance={leaveBalances.sick} bgColor="bg-orange-500" />
                        <LeaveBalanceCard icon={<CalendarDays size={24}/>} title="Earned Leave" balance={leaveBalances.earned} bgColor="bg-teal-500" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="p-6 border-b border-slate-200"><h2 className="text-xl font-semibold text-slate-800">My Leave History</h2></div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Leave Type</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Dates</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Reason</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {leaveHistory.length > 0 ? leaveHistory.map(leave => (
                                    <tr key={leave.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium">{leave.leaveType}</td>
                                        <td className="p-4 text-slate-600">{leave.startDate} to {leave.endDate}</td>
                                        <td className="p-4 text-slate-600 truncate max-w-xs">{leave.reason}</td>
                                        <td className="p-4"><StatusBadge status={leave.status} /></td>
                                        <td className="p-4">
                                            {leave.status === 'PENDING' && (
                                                <button onClick={(e) => handleCancel(e, leave)} className="text-red-500 cursor-pointer hover:text-red-700 font-medium">
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8 text-slate-500">No leave history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for a New Leave">
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    {formError && <div className="p-3 bg-red-100 text-red-800 rounded-lg">{formError}</div>}
                    <div>
                        <label htmlFor="leaveType" className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                        <select id="leaveType" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                            <option value="CASUAL">Casual Leave</option>
                            <option value="SICK">Sick Leave</option>
                            <option value="EARNED">Earned Leave</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">Reason for Leave</label>
                        <textarea id="reason" rows="4" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Please provide a brief reason..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="attachment" className="block text-sm font-medium text-slate-700 mb-1">Attach Document (Optional)</label>
                        <input type="file" id="attachment" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2">
                            <Send size={16} /> Submit Request
                        </button>
                    </div>
                </form>
            </CustomModal>
        </div>
    );
};

export default LeaveManagementPage;