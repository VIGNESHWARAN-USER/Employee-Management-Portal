import api from '../../api'
import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';
import Modal from 'react-modal';
import { toast } from 'sonner';
import userimg from "../../assets/user.jpg";

// Per react-modal docs, setting the app element is important for accessibility.
Modal.setAppElement('#root');

// --- Helper for Status Badge Styles ---
const getStatusStyles = (status) => {
    switch (status) {
        case 'Active':
            return 'bg-green-200 text-green-900';
        case 'Onboarding':
            return 'bg-blue-200 text-blue-900';
        case 'Exiting':
            return 'bg-red-200 text-red-900';
        case 'Resigned':
            return 'bg-gray-200 text-gray-800';
        default:
            return 'bg-yellow-200 text-yellow-900';
    }
};


const ManageEmployee = () => {
    const [userData, setUserData] = useState([]);
    const [manager, setManager] = useState([]);

    // --- NEW: State for Search and Filter ---
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // --- State for Modals ---
    const [addModalIsOpen, setAddModalIsOpen] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [viewModalIsOpen, setViewModalIsOpen] = useState(false);

    // --- State for Data in Modals ---
    const [newEmployee, setNewEmployee] = useState({
        firstName: '', lastName: '', mobileNumber: '', alternateMobileNumber: '',
        status: 'Onboarding', password: '123456', dateOfJoining: '',
        salary: '', emailId: '', role: '', manager: null,
    });
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [viewingEmployee, setViewingEmployee] = useState(null);


    // --- Form Validation for Add Modal ---
    const isAddFormValid = useMemo(() => {
        const { firstName, lastName, emailId, mobileNumber, dateOfJoining, salary, role } = newEmployee;
        const isManagerValid = role !== 'Employee' || (role === 'Employee' && newEmployee.manager);
        return firstName && lastName && emailId && mobileNumber && dateOfJoining && salary && role && isManagerValid;
    }, [newEmployee]);


    // --- Data Fetching ---
    const fetchDetails = () => {
        const fetchPromise = api.get("/api/fetchAllUsers")
            .then(response => {
                setUserData(response.data);
                const managerList = response.data
                    .filter((emp) => emp.role === "Manager")
                    .map((emp) => ({ id: emp.id, name: `${emp.firstName} ${emp.lastName}` }));
                setManager(managerList);
                return response.data;
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
                throw error;
            });

        toast.promise(fetchPromise, {
            loading: 'Fetching employee data...',
            success: 'Data loaded successfully!',
            error: 'Failed to fetch data.',
        });
    };

    useEffect(() => { 
        fetchDetails();
    }, []);

    // --- NEW: Filtering Logic ---
    const filteredEmployees = useMemo(() => {
        return userData
            .filter(emp => {
                // Search term filter (case-insensitive)
                const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
            })
            .filter(emp => {
                // Status filter
                if (statusFilter === 'All') return true;
                return emp.status === statusFilter;
            });
    }, [userData, searchTerm, statusFilter]);


    // --- Modal Control ---
    const openAddModal = () => setAddModalIsOpen(true);
    const closeAddModal = () => setAddModalIsOpen(false);

    const openEditModal = (employee) => {
        const employeeToEdit = { ...employee, manager: employee.manager ? employee.manager.id : null };
        setEditingEmployee(employeeToEdit);
        setEditModalIsOpen(true);
    };
    const closeEditModal = () => {
        setEditModalIsOpen(false);
        setEditingEmployee(null);
    };

    const openViewModal = (employee) => {
        setViewingEmployee(employee);
        setViewModalIsOpen(true);
    };
    const closeViewModal = () => {
        setViewModalIsOpen(false);
        setViewingEmployee(null);
    };


    // --- Input Handlers ---
    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingEmployee(prev => ({ ...prev, [name]: value }));
    };


    // --- API Handlers ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isAddFormValid) {
            toast.error("Please fill in all required fields.");
            return;
        }
        const payload = { ...newEmployee, manager: newEmployee.manager ? newEmployee.manager  : null };
        console.log(payload);
        const addPromise = api.post("/api/addEmployee", payload);
        toast.promise(addPromise, {
            loading: 'Adding Employee...',
            success: (response) => {
                if (typeof response.data === 'string' && response.data.includes("already exist")) {
                    throw new Error(response.data);
                }
                fetchDetails();
                closeAddModal();
                return "Employee added successfully";
            },
            error: (err) => err.message || "An unexpected error occurred.",
        });
    };

    const handleDelete = (e, employeeId) => {
        e.preventDefault();
        toast.info( "This will start the exit process for the employee.", {
            action: { label: "Confirm", onClick: () => {
                const deletePromise = api.post("/api/deleteEmployee", { id: employeeId });
                toast.promise(deletePromise, {
                    loading: 'Moving employee to exiting process...',
                    success: () => { fetchDetails(); return 'Employee exit process has been initiated.'; },
                    error: 'Failed to initiate exit process.',
                });
            }},
            cancel: { label: "Cancel" }
        });
    };
    
    const handleUpdate = (e) => {
        e.preventDefault();
        const payload = { ...editingEmployee, manager: editingEmployee.manager ? { id: editingEmployee.manager } : null };
        const updatePromise = api.post("/api/updateEmployee", payload);
        toast.promise(updatePromise, {
            loading: 'Updating employee details...',
            success: () => { fetchDetails(); closeEditModal(); return 'Employee details updated successfully!'; },
            error: (err) => `Update failed: ${err.response?.data?.message || err.message}`,
        });
    };

    return (
        <div className="w-full h-full p-4 md:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Manage Employees</h1>
                     <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Exiting">Exiting</option>
                        <option value="Resigned">Resigned</option>
                    </select>
                
                    <button onClick={openAddModal} className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg">
                        <FaPlus className="mr-2" /> Add 
                    </button>
                </div>


                {/* Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                                    <th className="px-5 py-3 border-b-2 border-gray-200">Employee</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200">Role</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200">Status</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* --- RENDER FILTERED DATA --- */}
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-10 h-10">
                                                    <img className="w-full h-full rounded-full" src={userimg} alt={`${emp.firstName} ${emp.lastName}`} />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-gray-900 whitespace-no-wrap font-semibold">{emp.firstName} {emp.lastName}</p>
                                                    <p className="text-gray-600 whitespace-no-wrap">{emp.emailId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{emp.role}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${getStatusStyles(emp.status)}`}>
                                                <span aria-hidden className={`absolute inset-0 ${getStatusStyles(emp.status)} opacity-50 rounded-full`}></span>
                                                <span className="relative">{emp.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex items-center space-x-4">
                                                <button onClick={() => openViewModal(emp)} title="View Details" className="text-gray-500 hover:text-green-600 transition-colors duration-200">
                                                    <HiOutlineEye size={20} />
                                                </button>
                                                <button onClick={() => openEditModal(emp)} title="Edit Employee" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
                                                    <HiOutlinePencilAlt size={20} />
                                                </button>
                                                <button disabled={emp.status === "Exiting" || emp.status === "Resigned"} onClick={(e) => handleDelete(e, emp.id)} title="Initiate Exit" className="text-gray-500 hover:text-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <HiOutlineTrash size={20} />
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

            {/* --- All Modals (Add, Edit, View) remain unchanged --- */}
            {/* Add Employee Modal */}
            <Modal isOpen={addModalIsOpen} onRequestClose={closeAddModal} contentLabel="Add Employee Modal" className="modal" overlayClassName="overlay">
                <div className="p-2">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Employee</h2>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input required type="text" name="firstName" placeholder="First Name" onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input required type="text" name="lastName" placeholder="Last Name" onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input required type="email" name="emailId" placeholder="Email ID" onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input required type="text" name="mobileNumber" placeholder="Mobile Number" onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="text" name="alternateMobileNumber" placeholder="Alternate Mobile Number (Optional)" onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <select required name="role" value={newEmployee.role} onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select Role</option>
                                <option value="Manager">Manager</option>
                                <option value="HR">HR</option>
                                <option value="Employee">Employee</option>
                            </select>
                            <input required type="date" name="dateOfJoining" placeholder="Date of Joining" onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input required type="number" name="salary" placeholder="Salary" onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {newEmployee?.role === "Employee" &&
                                <select required name="manager" value={newEmployee.manager || ''} onChange={handleAddInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Manager</option>
                                    {manager.map((mgr) => (<option key={mgr.id} value={mgr.id}>{mgr.name}</option>))}
                                </select>
                            }
                        </div>
                        <div className="mt-8 flex justify-end space-x-4">
                            <button type="button" onClick={closeAddModal} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300">Cancel</button>
                            <button type="submit" disabled={!isAddFormValid} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">Add Employee</button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Edit Employee Modal */}
            {editingEmployee && (
                 <Modal isOpen={editModalIsOpen} onRequestClose={closeEditModal} contentLabel="Edit Employee Modal" className="modal" overlayClassName="overlay">
                    <div className="p-2">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Employee Details</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" name="firstName" value={editingEmployee.firstName} placeholder="First Name" onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="text" name="lastName" value={editingEmployee.lastName} placeholder="Last Name" onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="email" name="emailId" value={editingEmployee.emailId} placeholder="Email ID" readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                                <input type="text" name="mobileNumber" value={editingEmployee.mobileNumber} placeholder="Mobile Number" onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="text" name="alternateMobileNumber" value={editingEmployee.alternateMobileNumber || ''} placeholder="Alternate Mobile Number" onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <select name="role" value={editingEmployee.role} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="Manager">Manager</option>
                                    <option value="HR">HR</option>
                                    <option value="Employee">Employee</option>
                                </select>
                                <input type="date" name="dateOfJoining" value={editingEmployee.dateOfJoining.split('T')[0]} placeholder="Date of Joining" onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="number" name="salary" value={editingEmployee.salary} placeholder="Salary" onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {editingEmployee.role === "Employee" &&
                                    <select name="manager" value={editingEmployee.manager || ''} onChange={handleEditInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select Manager</option>
                                        {manager.map((mgr) => (<option key={mgr.id} value={mgr.id}>{mgr.name}</option>))}
                                    </select>
                                }
                            </div>
                            <div className="mt-8 flex justify-end space-x-4">
                                <button type="button" onClick={closeEditModal} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-300">Update Employee</button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {/* View Employee Modal */}
            {viewingEmployee && (
                <Modal isOpen={viewModalIsOpen} onRequestClose={closeViewModal} contentLabel="View Employee Details" className="modal" overlayClassName="overlay">
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Employee Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <img className="w-20 h-20 rounded-full" src={userimg} alt={`${viewingEmployee.firstName} ${viewingEmployee.lastName}`} />
                                <div>
                                    <p className="text-xl font-bold text-gray-900">{`${viewingEmployee.firstName} ${viewingEmployee.lastName}`}</p>
                                    <p className="text-gray-600">{viewingEmployee.emailId}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className='bg-gray-50 p-3 rounded-lg'>
                                    <p className="text-sm font-medium text-gray-500">Role</p>
                                    <p className="text-md font-semibold text-gray-900">{viewingEmployee.role}</p>
                                </div>
                                <div className='bg-gray-50 p-3 rounded-lg'>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="text-md font-semibold text-gray-900">{viewingEmployee.status}</p>
                                </div>
                                <div className='bg-gray-50 p-3 rounded-lg'>
                                    <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                                    <p className="text-md font-semibold text-gray-900">{viewingEmployee.mobileNumber}</p>
                                </div>
                                <div className='bg-gray-50 p-3 rounded-lg'>
                                    <p className="text-sm font-medium text-gray-500">Date of Joining</p>
                                    <p className="text-md font-semibold text-gray-900">{new Date(viewingEmployee.dateOfJoining).toLocaleDateString()}</p>
                                </div>
                                <div className='bg-gray-50 p-3 rounded-lg'>
                                    <p className="text-sm font-medium text-gray-500">Salary</p>
                                    <p className="text-md font-semibold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(viewingEmployee.salary)}</p>
                                </div>
                                {viewingEmployee.manager && (
                                     <div className='bg-gray-50 p-3 rounded-lg'>
                                         <p className="text-sm font-medium text-gray-500">Manager</p>
                                         <p className="text-md font-semibold text-gray-900">{`${viewingEmployee.manager.firstName} ${viewingEmployee.manager.lastName}`}</p>
                                     </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button type="button" onClick={closeViewModal} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-300">Close</button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default ManageEmployee;