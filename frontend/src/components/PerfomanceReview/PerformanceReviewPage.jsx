import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api'
import { Award, ChevronRight, BarChart2, CheckCircle, Clock } from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'; // This import will now work
import { Bar, Radar } from 'react-chartjs-2'; // This import will now work

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// --- Helper Components ---
const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
        COMPLETED: 'bg-blue-100 text-blue-800 ring-blue-600/20',
        ACKNOWLEDGED: 'bg-green-100 text-green-800 ring-green-600/20',
    };
    const icons = {
        PENDING: <Clock size={14} />,
        COMPLETED: <CheckCircle size={14} />,
        ACKNOWLEDGED: <CheckCircle size={14} />,
    }
    const statusKey = status ? status.toUpperCase() : 'PENDING';
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${styles[statusKey]}`}>
            {icons[statusKey]} {status}
        </span>
    );
};

const ReviewDetailModal = ({ review, isOpen, onClose,fetchReviews }) => {
    if (!isOpen || !review) return null;

    const handleAcknowledge = async(e, review) =>{
        e.preventDefault();
        try{
            const response = await api.post("/api/acknowledgeReview", review)
            console.log(response.data);
            fetchReviews();
            onClose();

        }
        catch(e)
        {
            console.log(e);
        }
    }

    const barChartData = {
        labels: ['Punctuality', 'Leadership', 'Teamwork', 'Technical Skills', 'Communication'],
        datasets: [
            {
                label: 'Rating',
                data: [
                    review.punctuality,
                    review.leadership,
                    review.teamwork,
                    review.technicalSkills,
                    review.communication,
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Options to configure the horizontal bar chart
    const barOptions = {
        indexAxis: 'y', // This makes the bar chart horizontal
        responsive: true,
        plugins: {
            legend: {
                display: false, // Hide legend as the chart is self-explanatory
            },
            title: {
                display: false, // We have a custom title outside the chart
            },
        },
        scales: {
            x: { // The horizontal axis (now showing values)
                beginAtZero: true,
                suggestedMax: 5, // Set the scale to go up to 5
                grid: {
                    display: true,
                },
            },
            y: { // The vertical axis (now showing labels)
                grid: {
                    display: true, // Hide the y-axis grid lines for a cleaner look
                }
            }
        },
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all scale-95 duration-300 ease-out">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Review Details</h3>
                        <p className="text-sm text-slate-500">
                            Review for {new Date(review.reviewPeriodStart).toLocaleDateString()} - {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                        </p>
                    </div>
                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left Side: Radar Chart */}
                        <div className="lg:col-span-3">
                             <h4 className="font-semibold text-slate-700 mb-4 text-center">Category Ratings</h4>
                            <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-xl">
                                <Bar data={barChartData} options={barOptions} />
                            </div>
                        </div>

                        {/* Right Side: Overall, Comments & Goals */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="text-center bg-sky-50 p-4 rounded-xl border border-sky-200">
                                <p className="text-slate-600 font-semibold">Overall Rating</p>
                                <p className="text-6xl font-bold text-sky-600">{review.overallRating}</p>
                            </div>
                             <div className="text-center bg-green-50 p-4 rounded-xl border border-green-200">
                                <h4 className="font-semibold text-slate-700">Goals Achieved</h4>
                                <p className="text-3xl font-bold text-green-600">{review.goalsAchieved}%</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Reviewer's Comments</h4>
                                <p className="text-slate-600 text-sm p-3 bg-white rounded-md border h-40 overflow-y-auto">{review.comments}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Close</button>
                    {review.status !== 'ACKNOWLEDGED' && (
                         <button onClick={(e) => handleAcknowledge(e, review)} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Acknowledge Review</button>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const PerformanceReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [latestReview, setLatestReview] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
            try {
                const employeeId = JSON.parse(localStorage.getItem("userData"))?.id;
                if (!employeeId) {
                     console.error("Employee not found");
                     setLoading(false);
                     return;
                }
                // Use your actual API endpoint
                const response = await api.get(`/api/performance-reviews/employee/${employeeId}`);
                
                const sortedReviews = response.data.sort((a, b) => new Date(b.reviewPeriodEnd) - new Date(a.reviewPeriodEnd));
                
                setReviews(sortedReviews);
                if (sortedReviews.length > 0) {
                    setLatestReview(sortedReviews[0]);
                }
            } catch (error) {
                console.error("Failed to fetch performance reviews:", error);
            } finally {
                setLoading(false);
            }
        }

    useEffect(() => {
        

        fetchReviews();
    }, []);

    const handleViewDetails = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading reviews...</div>
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">My Performance Reviews</h1>

                {/* Latest Review Summary */}
                {latestReview && (
                    <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-200/80">
                        <h2 className="text-xl font-semibold text-slate-700 mb-4">Latest Review Summary</h2>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-sky-500 to-indigo-500 text-white p-6 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <Award size={32} />
                                </div>
                                <div>
                                    <p className="font-bold text-2xl">{latestReview.overallRating} / 5.0</p>
                                    <p className="opacity-80 text-sm">Overall Rating</p>
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="font-semibold">Review Period</p>
                                <p className="opacity-80 text-sm">
                                    {new Date(latestReview.reviewPeriodStart).toLocaleDateString()} - {new Date(latestReview.reviewPeriodEnd).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => handleViewDetails(latestReview)} className="bg-white text-sky-600 font-bold px-6 py-3 rounded-lg shadow-md hover:bg-slate-100 transition-all flex items-center gap-2">
                                View Full Report <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Review History Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-slate-800">Review History</h2>
                        <BarChart2 className="text-slate-400" size={24} />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Review Period</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Overall Rating</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {reviews.length > 0 ? reviews.map(review => (
                                    <tr key={review.reviewId} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-800">
                                            {new Date(review.reviewPeriodStart).toLocaleDateString()} - {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-slate-600 font-bold text-lg">{review.overallRating}</td>
                                        <td className="p-4"><StatusBadge status={review.status} /></td>
                                        <td className="p-4">
                                            <button onClick={() => handleViewDetails(review)} className="text-sky-600 font-semibold hover:underline">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                     <tr>
                                        <td colSpan="4" className="text-center p-8 text-slate-500">No performance reviews found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <ReviewDetailModal 
                review={selectedReview}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} 
                fetchReviews = {()=>fetchReviews()}
            />
        </div>
    );
};

export default PerformanceReviewPage;