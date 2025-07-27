import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    Mail, Phone, Briefcase, DollarSign, CheckCircle, XCircle, Camera, Users
} from 'lucide-react';

// Import React Bootstrap components
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

// --- Reusable Components ---
const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-sm font-normal text-slate-500">{label}</p>
        <p className="text-base font-medium text-slate-800">{value || 'N/A'}</p>
    </div>
);

const ChecklistItem = ({ label, isChecked }) => (
    <div className="flex items-center space-x-3">
        {isChecked ? (
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
        ) : (
            <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
        )}
        <span className="text-slate-700">{label}</span>
    </div>
);

const SectionCard = ({ icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
        <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                {React.cloneElement(icon, { className: "mr-3 h-6 w-6 text-sky-500" })}
                {title}
            </h2>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

// --- Modal Component ---
// It now accepts props for visibility, closing, and the image source.
function AadhaarPanModal(props) {
  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Aadhaar / PAN Card</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {props.imgsrc ? (
            <img src={props.imgsrc} alt="Aadhaar or PAN Document" className="max-w-full h-auto" />
        ) : (
            <p>Image not available or failed to load.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

// --- Main Profile Component ---
const EmployeeProfile = () => {
    const [employeeData, setEmployeeData] = useState(JSON.parse(localStorage.getItem("userData")) || {});
    const [profileImage, setProfileImage] = useState(null);
    const [aadhaarPanImage, setAadhaarPanImage] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const fileInputRef = useRef(null);

    // Effect to fetch binary images (Profile Pic & Aadhaar/PAN) and convert to Base64
    useEffect(() => {
        if (!employeeData?.id) return;

        const fetchImage = async (url, setImageState) => {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                const mimeType = response.headers['content-type'];
                const base64 = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                setImageState(`data:${mimeType};base64,${base64}`);
            } catch (error) {
                console.error(`Failed to load image from ${url}`, error);
                setImageState(null); // Set to null on error
            }
        };

        fetchImage(`http://localhost:8080/api/getProfilePic/${employeeData.id}`, setProfileImage);
        fetchImage(`http://localhost:8080/api/getAadhaarPan/${employeeData.id}`, setAadhaarPanImage); // Assuming this endpoint exists

    }, [employeeData?.id]);

    const handleProfilePicChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !employeeData?.id) return;

        const tempUrl = URL.createObjectURL(file);
        setProfileImage(tempUrl);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`http://localhost:8080/api/setProfilePic/${employeeData.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log("Profile picture updated successfully.");
        } catch (error) {
            console.error('Failed to upload profile image', error);
        }
    };

    const triggerFileSelect = () => fileInputRef.current.click();

    if (!employeeData?.id) {
        return <div className="text-center p-10">Loading employee data...</div>;
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <img src={profileImage || "/default-profile.png"} alt="Profile" className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg" />
                            <button onClick={triggerFileSelect} className="absolute bottom-1 right-1 bg-white hover:bg-sky-100 text-sky-600 rounded-full p-2 shadow transition-all" aria-label="Change profile picture">
                                <Camera className="h-5 w-5" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/png, image/jpeg" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">{employeeData.firstName} {employeeData.lastName}</h1>
                            <p className="text-lg text-slate-600 mt-1">{employeeData.role}</p>
                            <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${employeeData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{employeeData.status}</span>
                                <div className="flex items-center text-slate-500 gap-2"><Mail size={16} /><span>{employeeData.officialEmail}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="space-y-8">
                    <SectionCard icon={<Briefcase />} title="Key Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                            <InfoItem label="Mobile Number" value={employeeData.mobileNumber} />
                            <InfoItem label="Date of Joining" value={new Date(employeeData.dateOfJoining).toLocaleDateString()} />
                            <InfoItem label="Manager" value={employeeData.manager ? `${employeeData.manager.firstName} ${employeeData.manager.lastName}` : 'N/A'} />
                            <InfoItem label="Base Salary" value={`$${parseFloat(employeeData.salary || 0).toLocaleString()}`} />
                            <div className="lg:col-span-2"><button className="text-sky-600 font-medium hover:underline">View Detailed Salary Structure</button></div>
                        </div>
                    </SectionCard>
                    
                    <SectionCard icon={<CheckCircle />} title="Onboarding & Assets">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-700">Onboarding Checklist</h3>
                                <InfoItem label="Orientation Date" value={new Date(employeeData.orientationDate).toLocaleDateString()} />
                                <div className='flex items-center gap-4'>
                                    {/* The !! converts the aadhaarPan (array) to a boolean for the checkmark */}
                                    <ChecklistItem label="Aadhaar/PAN Document" isChecked={!!employeeData.aadhaarPan} />
                                    <button onClick={() => setModalShow(true)} className='text-sm bg-sky-500 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-sky-600 transition-colors disabled:bg-gray-300' disabled={!aadhaarPanImage}>View</button>
                                </div>
                                <ChecklistItem label="Knowledge Transfer Completed" isChecked={employeeData.knowledgeTransfer} />
                                <ChecklistItem label="Added to Payroll" isChecked={employeeData.payRoll} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-700">Asset Status</h3>
                                <ChecklistItem label="Company Laptop Assigned" isChecked={employeeData.laptopAssigned} />
                                {/* The 'idReturned' field is false when the ID is assigned, so we negate it for the label */}
                                <ChecklistItem label="ID Card Assigned" isChecked={!employeeData.idReturned} />
                            </div>
                        </div>
                    </SectionCard>

                    {employeeData.employees?.length > 0 && (
                        <SectionCard icon={<Users />} title="Direct Reports">
                            {/* ... same as before ... */}
                        </SectionCard>
                    )}
                </div>

                {/* Modal is now called here, passing the required props */}
                <AadhaarPanModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    imgsrc={aadhaarPanImage}
                />
            </div>
        </div>
    );
};

export default EmployeeProfile;