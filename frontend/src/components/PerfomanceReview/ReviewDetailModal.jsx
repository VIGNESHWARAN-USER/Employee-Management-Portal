import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components needed for the Bar Chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReviewDetailModal = ({ review, isOpen, onClose }) => {
    if (!isOpen || !review) return null;

    // Data for the horizontal bar chart
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
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl"
                onClick={e => e.stopPropagation()} // Prevent modal closing when clicking inside
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Review Details</h3>
                        <p className="text-sm text-slate-500">
                            Review for {new Date(review.reviewPeriodStart).toLocaleDateString()} - {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                        </p>
                    </div>
                     <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
                </div>
                
                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left Side: Bar Chart */}
                        <div className="lg:col-span-3">
                             <h4 className="font-semibold text-slate-700 mb-4 text-center">Category Ratings</h4>
                            <div className="p-4 bg-slate-50/70 h-full flex items-center justify-center rounded-xl">
                                <Bar data={barChartData} options={barOptions} />
                            </div>
                        </div>

                        {/* Right Side: Overall, Comments & Goals */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="text-center bg-sky-50 p-4 rounded-xl border border-sky-200">
                                <p className="text-slate-600 font-semibold">Overall Rating</p>
                                <p className="text-5xl font-bold text-sky-600">{review.overallRating.toFixed(1)}</p>
                            </div>
                             <div className="text-center bg-green-50 p-4 rounded-xl border border-green-200">
                                <h4 className="font-semibold text-slate-700">Goals Achieved</h4>
                                <p className="text-3xl font-bold text-green-600">{review.goalsAchieved}%</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Reviewer's Comments</h4>
                                <p className="text-slate-600 text-sm p-3 bg-white rounded-md border h-28 overflow-y-auto">{review.comments}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetailModal;