import axios from 'axios';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FaUsers, FaUserClock, FaArrowLeft, FaCheckCircle, FaHourglassHalf, FaClipboardList, FaUpload, FaEdit, FaSave } from 'react-icons/fa';
import { toast } from 'sonner';

// --- (Templates and Helper Components remain the same) ---
const INTERACTIVE_ONBOARDING_CHECKLIST = [
    { id: 'onboard-1', task: 'Upload Aadhar/PAN Card', assignedTo: 'Employee', type: 'file', dataField: 'aadhaarPan' },
    { id: 'onboard-2', task: 'Create Official Email ID', assignedTo: 'HR/Admin', type: 'email', dataField: 'officialEmail' },
    { id: 'onboard-3', task: 'Assign Company Laptop', assignedTo: 'Admin', type: 'toggle', dataField: 'laptopAssigned' },
    { id: 'onboard-4', task: 'Schedule Orientation Session', assignedTo: 'HR', type: 'date', dataField: 'orientationDate' },
    { id: 'onboard-5', task: 'Add to Payroll', assignedTo: 'Finance', type: 'toggle', dataField: 'payRoll' },
];

const INTERACTIVE_EXITING_CHECKLIST = [
    { id: 'exit-1', task: 'Return Company ID Card', assignedTo: 'Employee', type: 'toggle', dataField: 'idReturned' },
    { id: 'exit-2', task: 'Return Company Laptop & Assets', assignedTo: 'IT/Admin', type: 'toggle', dataField: 'laptopAssigned' },
    { id: 'exit-3', task: 'Knowledge Transfer Session', assignedTo: 'Employee/Manager', type: 'toggle', dataField: 'knowledgeTransfer' },
    { id: 'exit-4', task: 'Conduct Exit Interview', assignedTo: 'HR', type: 'toggle', dataField: 'exitInterview' },
    { id: 'exit-5', task: 'Process Final Settlement', assignedTo: 'Finance', type: 'toggle', dataField: 'payRoll' },
];

const isTaskCompleted = (employee, dataField) => {
    var value = employee?.[dataField];
    if(dataField == "payRoll" && employee.status == "Exiting") 
    {
        value = !!value
    }
    if (typeof value === 'boolean') {
        return value === true;
    }
    return !!value;
};

const InteractiveTaskItem = ({ task, employee, onUpdate, onFileUpload, onNavigate }) => {
    const isCompleted = isTaskCompleted(employee, task.dataField);
    const [editMode, setEditMode] = useState(false);
    const [value, setValue] = useState(employee[task.dataField] || '');
    console.log(employee)
    useEffect(() => {
        setValue(employee[task.dataField] || '');
    }, [employee, task.dataField]);

    const handleSave = () => {
        onUpdate(task.dataField, value);
        setEditMode(false);
    };

    const renderControls = () => {
        if (isCompleted && !editMode) {
             return (
                <div className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-sm font-semibold text-green-700">Done</span>
                    {task.type !== 'toggle' && (
                        <button onClick={() => setEditMode(true)} className="p-1 text-gray-500 hover:text-blue-600" title="Edit"><FaEdit /></button>
                    )}
                </div>
            );
        }

        switch (task.type) {
            case 'file':
                return (
                    <label className="flex items-center space-x-2 cursor-pointer bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm">
                        <FaUpload />
                        <span>Upload</span>
                        <input type="file" className="hidden" onChange={(e) => onFileUpload(task.dataField, e.target.files[0])} />
                    </label>
                );
            case 'email':
            case 'date':
                const inputType = task.type === 'date' ? 'date' : 'email';
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type={inputType}
                            value={value?.split ? value.split('T')[0] : value}
                            onChange={(e) => setValue(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm w-40"
                        />
                        <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" title="Save"><FaSave /></button>
                        {editMode && <button type="button" onClick={() => setEditMode(false)} className="px-3 py-1 bg-gray-200 rounded-md text-sm">Cancel</button>}
                    </div>
                );
            case 'toggle':
                return (
                    (((task.dataField == "payRoll" && employee.payRoll == false) && <button onClick={()=>onNavigate("salary")} className='bg-blue-600 text-white rounded-lg px-2 py-2 cursor-pointer'>Go to Payroll</button>)
                    || <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isCompleted} onChange={() => onUpdate(task.dataField, !isCompleted)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>) 
                );
            default:
                return null;
        }
    };
    
    return (
         <li className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-center">
                {isCompleted ? <FaCheckCircle className="mr-4 text-green-500" size={20} /> : <FaHourglassHalf className="mr-4 text-yellow-500" size={20} />}
                <div>
                    <p className={`font-medium text-gray-800 ${isCompleted ? 'line-through text-gray-500' : ''}`}>{task.task}</p>
                    <p className="text-xs text-gray-500">Assigned to: {task.assignedTo}</p>
                </div>
            </div>
            {renderControls()}
        </li>
    );
};


const OnboardingAndExit = ({onNavigate}) => {
    // --- State Management ---
    const [view, setView] = useState('list');
    const [activeList, setActiveList] = useState('onboarding');
    const [allEmployees, setAllEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // --- FIX: Initial Data Fetching ---
    // This useCallback has an empty dependency array [], so it is created only ONCE.
    const fetchEmployeeData = useCallback(() => {
        toast.promise(axios.get("http://localhost:8080/api/fetchAllUsers"), {
            loading: 'Fetching employee data...',
            success: (response) => {
                if (Array.isArray(response.data)) {
                    setAllEmployees(response.data);
                } else {
                    setAllEmployees([]);
                }
                return 'Employee data loaded successfully!';
            },
            error: () => 'Failed to fetch employee data.',
        });
    }, []); // <-- Empty dependency array is the crucial fix.

    // This useEffect now runs only ONCE when the component mounts.
    useEffect(() => {
        fetchEmployeeData();
    }, [fetchEmployeeData]);


    // --- Derived Data ---
    const onboardingEmployees = useMemo(() => allEmployees.filter(e => e.status === 'Onboarding'), [allEmployees]);
    const exitingEmployees = useMemo(() => allEmployees.filter(e => e.status === 'Exiting'), [allEmployees]);
    const currentChecklist = activeList === 'onboarding' ? INTERACTIVE_ONBOARDING_CHECKLIST : INTERACTIVE_EXITING_CHECKLIST;
    const progress = useMemo(() => {
        if (!selectedEmployee) return 0;
        const completedCount = currentChecklist.filter(task => isTaskCompleted(selectedEmployee, task.dataField)).length;
        return (completedCount / currentChecklist.length) * 100;
    }, [selectedEmployee, currentChecklist]);
    const allTasksCompleted = progress === 100;

    // --- Event Handlers ---
    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setView('checklist');
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedEmployee(null);
    };

    // FIX: A dedicated function to update state locally after a successful API call.
    const updateLocalEmployeeState = (updatedEmployee) => {
        setSelectedEmployee(updatedEmployee);
        setAllEmployees(currentEmployees =>
            currentEmployees.map(emp =>
                emp.id === updatedEmployee.id ? updatedEmployee : emp
            )
        );
    };

    const handleTaskUpdate = (fieldName, fieldValue) => {
        const payload = { emailId:selectedEmployee.emailId, name: fieldName, value: fieldValue };
        console.log(payload)
        const promise = axios.post(`http://localhost:8080/api/update-field`, payload)
            .then(response => {
                // The backend must return the updated employee object.
                updateLocalEmployeeState(response.data);
            });

        toast.promise(promise, {
            loading: 'Saving task...',
            success: 'Task updated successfully!',
            error: 'Failed to update task.',
        });
    };

    const handleFileUpload = (fieldName, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', selectedEmployee.emailId);
        
        const promise = axios.post(`http://localhost:8080/api/uploadDocument`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(response => {
            updateLocalEmployeeState(response.data);
        });

        toast.promise(promise, {
            loading: 'Uploading document...',
            success: 'Document uploaded successfully!',
            error: 'Failed to upload document.',
        });
    };

    const handleFinalize = () => {
        if (!allTasksCompleted) {
            toast.error("All checklist items must be completed to finalize.");
            return;
        }

        const newStatus = activeList === 'onboarding' ? 'Active' : 'Resigned';
        const promise = axios.post(`http://localhost:8080/api/updatestatus`, { emailId: selectedEmployee.emailId,status: newStatus })
            .then(() => {
                // Just remove the finalized user from the local list.
                setAllEmployees(current => current.filter(emp => emp.id !== selectedEmployee.id));
                handleBackToList();
            });

        toast.promise(promise, {
            loading: `Finalizing ${activeList}...`,
            success: `Process finalized successfully!`,
            error: 'Failed to finalize process.',
        });
    };

    // --- Render Logic (No changes needed here) ---
    const renderListView = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div onClick={() => setActiveList('onboarding')} className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${activeList === 'onboarding' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between"><h3 className="text-xl font-bold">Employees Onboarding</h3><FaUserClock size={28} /></div>
                    <p className="text-4xl font-extrabold mt-3">{onboardingEmployees.length}</p>

                </div>
                <div onClick={() => setActiveList('exit')} className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${activeList === 'exit' ? 'bg-red-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between"><h3 className="text-xl font-bold">Employees Exiting</h3><FaUsers size={28} /></div>
                    <p className="text-4xl font-extrabold mt-3">{exitingEmployees.length}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{activeList === 'onboarding' ? 'Onboarding Employee List' : 'Exiting Employee List'}</h2>
                <ul className="space-y-4">
                    {(activeList === 'onboarding' ? onboardingEmployees : exitingEmployees).map(emp => (
                        <li key={emp.id} onClick={() => handleEmployeeClick(emp)} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                            <div><p className="font-semibold text-gray-900">{`${emp.firstName} ${emp.lastName}`}</p><p className="text-sm text-gray-500">ID: {emp.id}</p></div>
                            <span className="px-3 py-1 text-xs font-bold rounded-full">{emp.status}</span>
                        </li>
                    ))}
                    {(activeList === 'onboarding' ? onboardingEmployees : exitingEmployees).length === 0 && (
                        <p className="text-center text-gray-500 py-8">No employees in this list.</p>
                    )}
                </ul>
            </div>
        </>
    );

    const renderChecklistView = () => (
        <div>
            <button onClick={handleBackToList} className="flex items-center text-sm text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors"><FaArrowLeft className="mr-2" />Back to Employee Lists</button>
            <div className="bg-white p-8 rounded-xl shadow-xl mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</h2>
                <p className="text-gray-600 mt-1">Status: <span className={`font-semibold ${activeList === 'onboarding' ? 'text-blue-600' : 'text-red-600'}`}>{selectedEmployee.status}</span></p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl">
                <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-800">{activeList === 'onboarding' ? 'Onboarding Checklist' : 'Exit Checklist'}</h2><FaClipboardList className="text-gray-400" size={24} /></div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2"><div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                <p className="text-right text-sm font-semibold text-gray-700 mb-8">{Math.round(progress)}% Complete</p>
                <ul className="space-y-4">
                    {currentChecklist.map(item => (
                        <InteractiveTaskItem
                            key={item.id}
                            task={item}
                            employee={selectedEmployee}
                            onUpdate={handleTaskUpdate}
                            onFileUpload={handleFileUpload}
                            onNavigate={onNavigate}
                        />
                    ))}
                </ul>
                <button onClick={handleFinalize} disabled={!allTasksCompleted} className="w-full mt-8 py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg">
                   <FaCheckCircle className="mr-2" />
                   {activeList === 'onboarding' ? 'Mark Onboarding as Complete' : 'Finalize Employee Exit'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full p-4 md:p-8 bg-gray-100 font-sans">
            <div className="max-w-5xl mx-auto">
                {view === 'list' ? renderListView() : renderChecklistView()}
            </div>
        </div>
    );
};

export default OnboardingAndExit;