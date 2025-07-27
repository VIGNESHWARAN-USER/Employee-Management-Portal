import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Clock, Calendar, User, MessageSquare, AlertTriangle } from 'lucide-react';
import ConfirmationModal from './ComfirmationPage'; // Adjust path as needed

// --- Helper Components for UI ---

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
        APPROVED: 'bg-green-100 text-green-800 ring-green-600/20',
        REJECTED: 'bg-red-100 text-red-800 ring-red-600/20',
    };
    const statusKey = status ? status.toUpperCase() : 'PENDING'; // Fallback
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${styles[statusKey]}`}>
            {status}
        </span>
    );
};

// --- Main Manager Leave Approval Component ---

const ManagerLeaveApprovalPage = () => {
    // FIX 1: Initialize leaveRequests with an empty array.
    const [leaveRequests, setLeaveRequests] = useState([]);
    
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Added loading state for better UX

    useEffect(() => {
        // FIX 2: Correctly handle async operations inside useEffect.
        const fetchLeaveRequests = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/leaves/allRequests`);
                const data = response.data;
                
                setLeaveRequests(data);

                // Calculate stats based on the fetched data directly
                const pending = data.filter(r => r.status === 'PENDING').length;
                const approved = data.filter(r => r.status === 'APPROVED').length;
                const rejected = data.filter(r => r.status === 'REJECTED').length;
                setStats({ pending, approved, rejected });

            } catch (err) {
                console.error("Failed to fetch leave requests:", err);
                setError("Failed to load leave requests. Please try refreshing the page.");
            } finally {
                setLoading(false); // Stop loading indicator
            }
        };

        fetchLeaveRequests();
    }, []); // Empty dependency array means this runs once on mount

    const handleActionClick = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setIsModalOpen(true);
        setError('');
        setRemarks('');
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setActionType(null);
        setRemarks('');
    };

    const handleConfirmAction = async () => {
        if (!selectedRequest || !actionType) return;
        if (actionType === 'reject' && !remarks.trim()) {
            setError('Remarks are required when rejecting a request.');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8080/api/leaves/${selectedRequest.id}/${actionType}`);
            
            // Update UI and stats after successful action
            const updatedRequests = leaveRequests.map(req =>
                req.id === selectedRequest.id ? response.data : req
            );
            setLeaveRequests(updatedRequests);

            const pending = updatedRequests.filter(r => r.status === 'PENDING').length;
            const approved = updatedRequests.filter(r => r.status === 'APPROVED').length;
            const rejected = updatedRequests.filter(r => r.status === 'REJECTED').length;
            setStats({ pending, approved, rejected });

            console.log(`Request ${actionType}d successfully:`, response.data);
            handleModalClose();

        } catch (error) {
            console.error(`Failed to ${actionType} leave request:`, error);
            setError(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };


    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* --- Stats Section --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<Clock size={24} className="text-yellow-600" />} title="Pending Requests" value={stats.pending} color="bg-yellow-100" />
                    <StatCard icon={<Check size={24} className="text-green-600" />} title="Total Approved" value={stats.approved} color="bg-green-100" />
                    <StatCard icon={<X size={24} className="text-red-600" />} title="Total Rejected" value={stats.rejected} color="bg-red-100" />
                </div>

                {/* --- Leave Requests Table --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">Pending & Recent Requests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Employee</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Leave Type</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Dates</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Reason</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 text-center">Status</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center p-10">
                                            <p className="text-slate-500">Loading requests...</p>
                                        </td>
                                    </tr>
                                ) : leaveRequests.length > 0 ? (
                                    leaveRequests.map(request => (
                                        <tr key={request.id} className="hover:bg-slate-50">
                                            <td className="p-4 flex items-center gap-3">
                                                 <div className="p-4 font-medium">
                                                    {request.employee_id}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{request.name}</p>
                                                    <p className="text-xs text-slate-500">{request.emailId}</p> 
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">{request.leaveType}</td>
                                            <td className="p-4 text-slate-600">{request.startDate} to {request.endDate}</td>
                                            <td className="p-4 text-slate-600 truncate max-w-xs">{request.reason}</td>
                                            <td className="p-4 text-center"><StatusBadge status={request.status} /></td>
                                            <td className="p-4 text-center">
                                                {request.status === 'PENDING' ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleActionClick(request, 'APPROVED')} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"><Check size={18} /></button>
                                                        <button onClick={() => handleActionClick(request, 'REJECTED')} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"><X size={18} /></button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">Handled</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-10">
                                            <p className="text-slate-500">No leave requests to display at the moment.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onConfirm={handleConfirmAction}
                title={`Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
                actionType={actionType}
            >
                 {/* FIX 3: Safely access nested properties using optional chaining */}
                <p className="text-slate-600 mb-4">
                    Are you sure you want to {actionType} the leave request for <span className="font-bold">{selectedRequest?.name}</span> from <span className="font-bold">{selectedRequest?.startDate}</span> to <span className="font-bold">{selectedRequest?.endDate}</span>?
                </p>
                {actionType === 'reject' && (
                     <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-slate-700 mb-1">Reason for Rejection (Required)</label>
                        <textarea 
                            id="remarks" 
                            rows="3" 
                            value={remarks} 
                            onChange={(e) => setRemarks(e.otarget.value)} 
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            placeholder="Provide a clear reason..."
                        ></textarea>
                     </div>
                )}
                 {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={20} />
                        {error}
                    </div>
                )}
            </ConfirmationModal>
        </div>
    );
};

export default ManagerLeaveApprovalPage;