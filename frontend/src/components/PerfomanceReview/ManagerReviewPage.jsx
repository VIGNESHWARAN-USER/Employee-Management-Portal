import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Edit, UserCheck, Users, Clock, CheckCircle, Send, Save } from 'lucide-react';

// --- Helper Components ---

const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
        COMPLETED: 'bg-green-100 text-green-800 ring-green-600/20',
    };
    const icons = {
        PENDING: <Clock size={14} />,
        COMPLETED: <CheckCircle size={14} />,
    };
    const text = status === 'PENDING' ? 'Review Pending' : 'Review Completed';
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${styles[status]}`}>
            {icons[status]} {text}
        </span>
    );
};

const ReviewFormModal = ({ employee, isOpen, onClose, onReviewSubmit }) => {
    if (!isOpen || !employee) return null;

    const [formData, setFormData] = useState({
        goalsAchieved: 75,
        communication: 3,
        technicalSkills: 3,
        teamwork: 3,
        leadership: 3,
        punctuality: 3,
        comments: '',
        reviewPeriodStart: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Default to start of year
        reviewPeriodEnd: new Date(new Date().getFullYear(), 5, 30).toISOString().split('T')[0], // Default to mid-year
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSliderChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };
    
    const overallRating = useMemo(() => {
        const { goalsAchieved, communication, technicalSkills, teamwork, leadership, punctuality } = formData;
        const weightedSum =
            (goalsAchieved * 0.4) +
            (communication * 20 * 0.1) +
            (technicalSkills * 20 * 0.2) +
            (teamwork * 20 * 0.1) +
            (leadership * 20 * 0.1) +
            (punctuality * 20 * 0.1);
        
        const rating = (weightedSum / 20.0).toFixed(2);
        return isNaN(rating) ? '0.00' : rating;
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.comments) {
            setError('Reviewer comments are required.');
            return;
        }

        const managerId = JSON.parse(localStorage.getItem("userData"))?.id; // Assuming manager is logged in

        const reviewPayload = {
            reviewId: employee.reviewId,
            employeeId: employee.id,
            reviewerId: managerId,
            ...formData,
            overallRating: parseFloat(overallRating),
            status: 'COMPLETED'
        };
        
        try {
            // This function is passed from the parent to handle the actual API call
            await onReviewSubmit(reviewPayload);
            onClose(); // Close modal on success
        } catch(err) {
            setError(err.response?.data?.message || 'An error occurred while submitting.');
        }
    };
    
    const ratingCategories = [
        { name: 'communication', label: 'Communication' },
        { name: 'technicalSkills', label: 'Technical Skills' },
        { name: 'teamwork', label: 'Teamwork' },
        { name: 'leadership', label: 'Leadership' },
        { name: 'punctuality', label: 'Punctuality' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-slate-800">Performance Review for {employee.name}</h3>
                    <p className="text-sm text-slate-500">Department: {employee.department}</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Left side: Sliders and Dates */}
                        <div>
                            {/* Review Period */}
                             <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Period Start</label>
                                    <input type="date" name="reviewPeriodStart" value={formData.reviewPeriodStart} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Period End</label>
                                    <input type="date" name="reviewPeriodEnd" value={formData.reviewPeriodEnd} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg"/>
                                </div>
                            </div>
                            
                            {/* Ratings */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Goals Achieved: <span className="font-bold text-sky-600">{formData.goalsAchieved}%</span></label>
                                    <input type="range" min="0" max="100" name="goalsAchieved" value={formData.goalsAchieved} onChange={handleInputChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                                </div>
                                {ratingCategories.map(cat => (
                                     <div key={cat.name}>
                                        <label className="block text-sm font-medium text-slate-700">{cat.label}: <span className="font-bold text-sky-600">{formData[cat.name]}/5</span></label>
                                        <input type="range" min="1" max="5" name={cat.name} value={formData[cat.name]} onChange={handleInputChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side: Comments and Overall Score */}
                        <div className="flex flex-col">
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center mb-6">
                                <p className="text-slate-600 font-semibold">Calculated Overall Rating</p>
                                <p className="text-6xl font-bold text-sky-600">{overallRating}</p>
                            </div>
                            <div>
                                <label htmlFor="comments" className="block text-sm font-medium text-slate-700 mb-1">Reviewer's Comments</label>
                                <textarea id="comments" name="comments" rows="10" value={formData.comments} onChange={handleInputChange} className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Provide detailed feedback, strengths, and areas for improvement..."></textarea>
                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2">
                            <Send size={16} /> Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Manager Review Component ---
const ManagerReviewPage = () => {
    const [employees, setEmployees] = useState([]);
    const [filter, setFilter] = useState('PENDING'); // 'PENDING' or 'COMPLETED'
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchManagerData = async () => {
            setLoading(true);
            try {
                const managerId = JSON.parse(localStorage.getItem("userData"))?.id;
                if (!managerId) {
                    console.error("Manager ID not found");
                    return;
                }
                
                // Fetch direct reports
                const empResponse = await axios.get(`http://localhost:8080/api/employees/manager/${managerId}`);
                const employeesData = empResponse.data;

                // For each employee, fetch their latest review to determine status
                // In a real app, this might be a single, more efficient API call
                const employeesWithStatus = await Promise.all(
                    employeesData.map(async (emp) => {
                        try {
                            // This endpoint should ideally get the *latest* review status
                            const reviewRes = await axios.get(`http://localhost:8080/api/performance-reviews/employee/${emp.id}/latest`);
                            console.log(reviewRes.data)
                            // Assuming the latest review determines the status for the current cycle
                            return { ...emp, reviewStatus: reviewRes.data.status || 'PENDING', reviewId:reviewRes.data.reviewId  };
                        } catch (e) {
                            // If no review found (404), it's pending
                            return { ...emp, reviewStatus: 'PENDING' };
                        }
                    })
                );
                
                setEmployees(employeesWithStatus);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchManagerData();
    }, []);
    
    const handleStartReview = (employee) => {
        console.log("Hi", employee)
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleReviewSubmit = async (reviewData) => {
        // This function is passed to the modal
        console.log("Submitting review:", reviewData);
        const response = await axios.post('http://localhost:8080/api/performance-reviews', reviewData);
        
        // Update the employee's status in the UI without a full reload
        setEmployees(prev => prev.map(emp => 
            emp.id === reviewData.employeeId ? { ...emp, reviewStatus: 'COMPLETED' } : emp
        ));
        alert('Review submitted successfully!');
        return response.data;
    };
    
    const filteredEmployees = employees.filter(emp => emp.reviewStatus === filter);

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Team Performance Reviews</h1>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex border-b border-slate-300">
                    <button onClick={() => setFilter('PENDING')} className={`px-4 py-2 text-lg font-semibold flex items-center gap-2 ${filter === 'PENDING' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
                        <Edit size={20}/> Pending Reviews
                    </button>
                    <button onClick={() => setFilter('COMPLETED')} className={`px-4 py-2 text-lg font-semibold flex items-center gap-2 ${filter === 'COMPLETED' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
                        <UserCheck size={20}/> Completed
                    </button>
                </div>

                {/* Employee List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
                     <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Employee Name</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Email ID</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Review Status</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center p-8">Loading...</td></tr>
                                ) : filteredEmployees.length > 0 ? filteredEmployees.map(employee => (
                                    <tr key={employee.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-800">{employee.firstName+" "+employee.lastName}</td>
                                        <td className="p-4 text-slate-600">{employee.officialEmail}</td>
                                        <td className="p-4"><StatusBadge status={employee.reviewStatus} /></td>
                                        <td className="p-4 text-center">
                                            {employee.reviewStatus === 'PENDING' ? (
                                                <button onClick={() => handleStartReview(employee)} className="bg-sky-600 text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-sky-700 transition-all flex items-center gap-2 mx-auto">
                                                    <Edit size={16}/> Start Review
                                                </button>
                                            ) : (
                                                 <button className="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg cursor-not-allowed">
                                                    View Submitted
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center p-8 text-slate-500">No employees found for this category.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ReviewFormModal 
                employee={selectedEmployee}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onReviewSubmit={handleReviewSubmit}
            />
        </div>
    );
};

export default ManagerReviewPage;   