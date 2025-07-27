import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  CalendarDays,
  Users,
  UserCheck,
  BarChart,
  PlayCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  X,
  Search,
  ArrowLeft,
} from 'lucide-react';
import axios from 'axios';

// --- Helper Component: StatCard ---
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
    <div className={`rounded-full p-3 ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// --- Helper Component: PayslipCard (for the dashboard) ---
const PayslipCard = ({ payslip, employee, salary, onViewDetails }) => {
  if (!employee || !salary) return null; // Defensive check for data integrity

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-green-50 rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-800">{employee.firstName} {employee.lastName}</h3>
        <span className="text-sm bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full">
          ₹{salary.netSalary?.toLocaleString()}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-500 mb-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          <span>{payslip.month}, {payslip.year}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CheckCircle className="w-3 h-3" />
          <span>Generated on: {new Date(payslip.generatedOn).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={() => onViewDetails(payslip)} 
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full"
        >
          <FileText size={16} /> View Details
        </button>
      </div>
    </div>
  );
};

// --- Helper Component: PayslipDetailModal ---
const PayslipDetailModal = ({ isOpen, onClose, payslip, employee, salary }) => {
  if (!isOpen || !payslip || !employee || !salary) return null;

  const DetailRow = ({ label, value, isTotal = false }) => (
    <div className={`flex justify-between py-2 ${isTotal ? 'border-t mt-2 pt-2 font-semibold' : ''}`}>
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
  console.log(salary)
  return (
    <div className="fixed inset-0 bg-white/30 border-gray-200 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white border-gray-600 border-2 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Payslip Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="text-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold">{employee.firstName} {employee.lastName}</h3>
          <p className="text-gray-500">{employee.role}</p>
          <p className="text-sm text-gray-400">{payslip.month} {payslip.year}</p>
        </div>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Earnings</h4>
            <DetailRow label="Basic Salary" value={`₹ ${salary.basic.toLocaleString()}`} />
            <DetailRow label="Allowances" value={`₹ ${salary.specialAllowance.toLocaleString()}`} />
            <DetailRow label="Gross Salary" value={`₹ ${salary.grossEarnings.toLocaleString()}`} isTotal={true} />
          </div>
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Deductions</h4>
            <DetailRow label="Taxes" value={`₹ ${salary.professionalTax.toLocaleString()}`} />
            <DetailRow label="Provident Fund" value={`₹ ${salary.providentFund.toLocaleString()}`} />
            <DetailRow label="Total Deductions" value={`₹ ${(salary.professionalTax + salary.providentFund).toLocaleString()}`} isTotal={true} />
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center mt-4">
            <p className="text-gray-600 text-lg">Net Salary Payable</p>
            <p className="text-3xl font-bold text-green-600">₹{salary.netSalary.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Component: PayslipHistory View ---
const PayslipHistory = ({ payslips, employees, onBack, onViewDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    const roles = useMemo(() => [...new Set(employees.map(e => e.employee.role).filter(Boolean))], [employees]);
    const months = useMemo(() => [...new Set(payslips.map(p => p.month).filter(Boolean))], [payslips]);

    const filteredPayslips = useMemo(() => {
        return payslips.map(p => {
            const salaryStructure = employees.find(e => e.id === p.salary.id);
            return { ...p, employee: salaryStructure?.employee, salary: salaryStructure };
        }).filter(p => {
            if (!p.employee || !p.salary) return false;
            const nameMatch = `${p.employee.firstName} ${p.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
            const roleMatch = selectedRole ? p.employee.role === selectedRole : true;
            const monthMatch = selectedMonth ? p.month === selectedMonth : true;
            return nameMatch && roleMatch && monthMatch;
        });
    }, [payslips, employees, searchTerm, selectedRole, selectedMonth]);

    return (
        <div>
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Payslip History</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <input type="text" placeholder="Search by Employee Name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500" />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-green-500">
                        <option value="">Filter by Role</option>
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                     <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-green-500">
                        <option value="">Filter by Month</option>
                        {months.map(month => <option key={month} value={month}>{month}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md">
                <div className="space-y-2 p-2">
                    {filteredPayslips.length > 0 ? (
                        filteredPayslips.map(p => (
                            <div key={p.id} className="rounded-lg hover:bg-gray-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div className="mb-2 sm:mb-0">
                                    <p className="font-bold text-gray-800">{p.employee.firstName} {p.employee.lastName}</p>
                                    <p className="text-sm text-gray-500">{p.employee.role} | {p.month}, {p.year}</p>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <p className="font-semibold text-gray-700 w-full sm:w-auto">₹{p.salary.netSalary.toLocaleString()}</p>
                                    <button onClick={() => onViewDetails(p)} className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 w-full sm:w-auto">View</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold">No Payslips Found</h3>
                            <p>No payslips match your current filter criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Application Component ---
const SalaryPayroll = () => {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'history'
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    const fetchAllData = () => {
        const salaryPromise = axios.get("http://localhost:8080/api/fetchAllSalaryStructures");
        const payslipPromise = axios.get("http://localhost:8080/api/fetchAllPayslips");

        return Promise.all([salaryPromise, payslipPromise])
            .then(([salaryRes, payslipRes]) => {
                setEmployees(salaryRes.data);
                setPayslips(payslipRes.data.sort((a,b) => new Date(b.generatedOn) - new Date(a.generatedOn)));
            });
    };
    
    toast.promise(fetchAllData(), {
        loading: 'Loading payroll data...',
        success: 'Data loaded successfully!',
        error: 'Failed to fetch initial data.'
    });
  }, []);

  const activeEmployeesCount = useMemo(() => employees.filter(emp => emp.employee.status === 'Active').length, [employees]);
  const totalPayrollCost = useMemo(() => employees
    .filter(emp => emp.employee.status === 'Active')
    .reduce((sum, emp) => sum + emp.netSalary, 0), [employees]);

  const runPayroll = () => {
    setIsProcessing(true);
    toast.info('Running payroll for all active employees...', { icon: <Clock className="animate-spin" /> });
    setTimeout(async () => {
      try {
        const activeEmployees = employees.filter((emp) => emp.employee.status === 'Active');
        if (activeEmployees.length === 0) {
            toast.error("No active employees to process payroll for.");
            setIsProcessing(false);
            return;
        }
        
        const newPayslipsPayload = activeEmployees.map((emp) => ({
          user: { id: emp.employee.id },
          salary: { id: emp.id },
          month: new Date().toLocaleString('default', { month: 'long' }),
          year: new Date().getFullYear(),
        }));

        const response = await axios.post("http://localhost:8080/api/storePaySlips", newPayslipsPayload);
        setPayslips(prev => [...response.data, ...prev].sort((a,b) => new Date(b.generatedOn) - new Date(a.generatedOn)));
        toast.success(`Payroll processed successfully for ${activeEmployees.length} employees!`);
      } catch (error) {
        console.error("Error running payroll:", error);
        toast.error("Failed to process payroll. Please check the console.");
      } finally {
        setIsProcessing(false);
      }
    }, 2500);
  };

  const handleViewDetails = (payslip) => {
    setSelectedPayslip(payslip);
    setIsModalOpen(true);
  };
  
  const selectedPayslipDetails = useMemo(() => {
    if (!selectedPayslip) return { employee: null, salary: null };
    const salaryStructure = employees.find(e => e.id === selectedPayslip.salary.id);
    return { employee: salaryStructure?.employee, salary: salaryStructure };
  }, [selectedPayslip, employees]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                 <StatCard icon={<Users size={24} className="text-blue-600" />} title="Total Employees" value={employees.length} color="bg-blue-100" />
                 <StatCard icon={<UserCheck size={24} className="text-green-600" />} title="Active for Payroll" value={activeEmployeesCount} color="bg-green-100" />
                 <StatCard icon={<BarChart size={24} className="text-indigo-600" />} title="Est. Monthly Payroll" value={`₹${totalPayrollCost.toLocaleString()}`} color="bg-indigo-100" />
                 <StatCard icon={<FileText size={24} className="text-amber-600" />} title="Total Payslips" value={payslips.length} color="bg-amber-100" />
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Run Monthly Payroll</h2>
                        <p className="text-gray-500 mt-1">Process payments for all <strong>{activeEmployeesCount} active employees</strong> for this cycle.</p>
                    </div>
                    <button onClick={runPayroll} disabled={isProcessing} className={`flex items-center justify-center gap-2.5 px-6 py-3 text-base font-bold text-white rounded-xl transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${isProcessing ? 'bg-yellow-500' : 'bg-green-600 hover:bg-green-700'}`}>
                         {isProcessing ? <Clock size={20} className="animate-spin" /> : <PlayCircle size={20} />}
                         {isProcessing ? 'Processing Payroll...' : 'Run Payroll Now'}
                    </button>
                </div>
            </div>

            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Recent Payslips</h2>
                <button onClick={() => setView('history')} className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 transition-colors">
                  View All History <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                 {payslips.slice(0, 6).map((payslip) => {
                    const salaryStructure = employees.find(e => e.id === payslip.salary.id);
                    return <PayslipCard key={payslip.id} payslip={payslip} employee={salaryStructure?.employee} salary={salaryStructure} onViewDetails={handleViewDetails}/>
                 })}
              </div>
            </section>
          </>
        ) : (
          <PayslipHistory payslips={payslips} employees={employees} onBack={() => setView('dashboard')} onViewDetails={handleViewDetails}/>
        )}

        <PayslipDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          payslip={selectedPayslip}
          employee={selectedPayslipDetails.employee}
          salary={selectedPayslipDetails.salary}
        />
      </div>
    </div>
  );
};

export default SalaryPayroll;