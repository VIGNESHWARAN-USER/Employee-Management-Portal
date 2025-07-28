import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Users, CheckSquare, Clock, Search, Eye } from 'lucide-react'; // Removed unused Bell, Radar
import ReviewDetailModal from './ReviewDetailModal'; // Your modal component

// Only register components for the Bar chart used in this file.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Reusable Helper Components ---
const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-6 border border-slate-200/80">
        <div className={`p-4 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 font-medium">{title}</p>
        </div>
    </div>
);




// --- Main Admin Dashboard Component ---
const AdminReviewDashboard = () => {
    const [allReviews, setAllReviews] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [filters, setFilters] = useState({ roles: 'All', status: 'All', search: '' });
    const [loading, setLoading] = useState(true);
    
    // State for managing the modal
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [roles, setroles] = useState(['HR', 'Manager', 'Employee']);

    const filteredReviews = useMemo(() => {
        return allReviews.filter(review => {
            const searchLower = filters.search.toLowerCase();
            return (filters.roles === 'All' || review.employee.role === filters.roles) &&
                   (filters.status === 'All' || review.status === filters.status) &&
                   (review.employee.firstName.toLowerCase().includes(searchLower) || review.reviewer.firstName.toLowerCase().includes(searchLower));
        });
    }, [allReviews, filters]);

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const reviewsResponse = await axios.get('http://localhost:8080/api/all-reviews');
                setAllReviews(reviewsResponse.data);
                
                const reviews = reviewsResponse.data;
                const completed = reviews.filter(r => r.status === 'COMPLETED').length;
                setStats({
                    total: reviews.length,
                    completed: completed,
                    pending: reviews.length - completed
                });
            } catch (error) {
                console.error("Failed to fetch admin review data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    // --- Modal Handler Functions ---
    const handleOpenModal = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReview(null);
    };

    // Data for the Performance Distribution Chart
    const performanceChartData = useMemo(() => {
        const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        allReviews
            .filter(r => r.status === 'COMPLETED')
            .forEach(r => {
                const rating = Math.round(r.overallRating);
                if (distribution[rating] !== undefined) {
                    distribution[rating]++;
                }
            });

        return {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Number of Employees',
                data: Object.values(distribution),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }]
        };
    }, [allReviews]);

    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Overall Performance Rating Distribution' } },
        scales: { y: { beginAtZero: true } }
    };

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<Users size={28} className="text-blue-500"/>} title="Total Reviews" value={stats.total} color="bg-blue-100"/>
                    <StatCard icon={<CheckSquare size={28} className="text-green-500"/>} title="Reviews Completed" value={stats.completed} color="bg-green-100"/>
                    <StatCard icon={<Clock size={28} className="text-yellow-500"/>} title="Pending Reviews" value={stats.pending} color="bg-yellow-100"/>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center border border-slate-200/80">
                    <div className="relative flex-grow w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                        <input type="text" name="search" placeholder="Search by employee or manager..." onChange={handleFilterChange} className="w-full p-2 pl-10 border border-slate-300 rounded-lg"/>
                    </div>
                    <select name="roles" onChange={handleFilterChange} className="w-full md:w-auto p-2 border border-slate-300 rounded-lg">
                        <option value="All">All Roles</option>
                        {roles.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                     <select name="status" onChange={handleFilterChange} className="w-full md:w-auto p-2 border border-slate-300 rounded-lg">
                        <option value="All">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>

                {/* Reviews Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Employee</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Role</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Manager/Reviewer</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Overall Rating</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center p-8 text-slate-500">Loading review data...</td></tr>
                                ) : filteredReviews.map(review => (
                                    <tr key={review.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-800">{review.employee.firstName+" "+review.employee.lastName}</td>
                                        <td className="p-4 text-slate-600">{review.employee.role}</td>
                                        <td className="p-4 text-slate-600">{review.reviewer.firstName+" "+review.reviewer.lastName}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${review.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">{review.status === 'COMPLETED' ? review.overallRating.toFixed(2) : 'N/A'}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    title="View Details" 
                                                    disabled={review.status !== 'COMPLETED'}
                                                    onClick={() => handleOpenModal(review)}
                                                    className="text-slate-500 hover:text-sky-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                                                >
                                                    <Eye size={20}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Cleaner modal call */}
            <ReviewDetailModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                review={selectedReview} 
            />

        </div>
    );
};

export default AdminReviewDashboard;