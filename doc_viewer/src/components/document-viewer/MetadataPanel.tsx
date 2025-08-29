
import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; 

const EditIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
        <path d="M6 9L12 15L18 9" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DocIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="#6B7280"/>
    </svg>
);

const CloseIcon: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <svg onClick={onClick} className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


// --- TypeScript Interfaces ---
interface CommonProperties { fillName?: string; emailAddress?: string; contactNumber?: string; }
interface DocTypeFields { [key: string]: string | undefined; }
export interface StructuredMetadata {
  folder?: string; docType?: string; master?: string;
  metaData?: { commonProperties?: CommonProperties; docTypeFields?: DocTypeFields; }
}


// --- Hardcoded Dummy Data 
const DUMMY_METADATA: StructuredMetadata = {
  folder: "Employee_2024",
  docType: "Invoice",
  master: "Invoice_Master, Invoice_Data",
  metaData: {
    commonProperties: {
      fillName: "Aditi Sharma",
      emailAddress: "aditi.sharma@example.com",
      contactNumber: "9876543210",
    },
    docTypeFields: {
      invoice: "INV-000002",
    },
  },
};

const MetadataField: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <p className="text-sm text-gray-800 font-semibold mt-1 break-words">{String(value)}</p>
    </div>
  );
};

const AccordionSection: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-gray-50 rounded-md border border-gray-200">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-md">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-700 text-sm">{title}</span>
                </div>
                <ChevronIcon isOpen={isOpen} />
            </button>
            {isOpen && <div className="p-4 border-t border-gray-200 space-y-4">{children}</div>}
        </div>
    );
};

// --- The Modal Component 
const LockedModal: React.FC<{ user: string; onCancel: () => void; onTryAgain: () => void; }> = ({ user, onCancel, onTryAgain }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Metadata Locked for Editing</h2>
                    <CloseIcon onClick={onCancel} />
                </div>
                <div className="p-6">
                    <p className="text-base text-gray-600 leading-relaxed">
                        <span className="font-bold text-gray-800">{user}</span> is currently editing this file's metadata. Please wait until they finish before making changes.
                    </p>
                </div>
                <div className="flex justify-end items-center p-6 space-x-4 bg-gray-50 rounded-b-lg">
                    <Button variant="outline" onClick={onCancel} className="px-6 py-2 text-base">
                        Cancel
                    </Button>
                    <Button onClick={onTryAgain} className="px-6 py-2 text-base bg-blue-600 text-white hover:bg-blue-700">
                        Try again
                    </Button>
                </div>
            </div>
        </div>
    );
};



const MetadataPanel: React.FC = () => {
  // State to control the visibility of the modal
  const [isLockedModalVisible, setIsLockedModalVisible] = useState(false);
  
  const editingUser = "Aditi Maurya"; // Dummy user for the modal message
  
  // Handlers for the modal
  const showModal = () => setIsLockedModalVisible(true);
  const hideModal = () => setIsLockedModalVisible(false);
  const handleTryAgain = () => {
      alert("Checking lock status again...");
      // In a real app, you would make an API call here.
      hideModal();
  };

  // Destructure the data for easier access
  const { folder, docType, master, metaData } = DUMMY_METADATA;
  const commonProps = metaData?.commonProperties;
  const docTypeFields = metaData?.docTypeFields;

  return (
    <div className="w-full h-full flex flex-col font-sans p-4">
      {/* Header with Title and Edit Button */}
      <div className="flex justify-between items-center py-3 flex-shrink-0">
        <h3 className="text-[#40566D] text-lg not-italic font-bold">
          Metadata
        </h3>
        {/* The Edit button now triggers the modal */}
        <Button onClick={showModal} variant="ghost" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold p-2">
            <EditIcon />
            Edit
        </Button>
      </div>
      
      {/* Content Area */}
      <div className="flex-grow space-y-5">
        {/* Top-level Properties */}
        <div className="space-y-4">
            <MetadataField label="Folder" value={folder} />
            <MetadataField label="DocType" value={docType} />
            <MetadataField label="Master" value={master} />
        </div>

        {/* "Meta Data" Section with Accordions */}
        <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Meta Data</h4>
            <div className="space-y-3">
                {commonProps && (
                    <AccordionSection title="Common Properties: Doctype & Master">
                        <MetadataField label="Fill Name" value={commonProps.fillName} />
                        <MetadataField label="Email Address" value={commonProps.emailAddress} />
                        <MetadataField label="Contact Number" value={commonProps.contactNumber} />
                    </AccordionSection>
                )}
                {docTypeFields && (
                    <AccordionSection title="DocType: Unique fields from DocType" icon={<DocIcon />}>
                        {Object.entries(docTypeFields).map(([key, value]) => (
                             <MetadataField 
                                key={key} 
                                label={key.charAt(0).toUpperCase() + key.slice(1)} 
                                value={value} 
                            />
                        ))}
                    </AccordionSection>
                )}
            </div>
        </div>
      </div>

      {/* Conditionally render the modal based on state */}
      {isLockedModalVisible && (
          <LockedModal 
              user={editingUser}
              onCancel={hideModal}
              onTryAgain={handleTryAgain}
          />
      )}
    </div>
  );
};

export default MetadataPanel;




