import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import createIcon from '../../assets/icons/Audit file created.svg';
import editIcon from '../../assets/icons/Audit pdf edited.svg';
import viewedIcon from '../../assets/icons/Audit file viewed.svg';
import downloadIcon from '../../assets/icons/Audit downloaded.svg';
import sharedIcon from '../../assets/icons/Audit shared.svg';
import revokeIcon from '../../assets/icons/Audit access revoked.svg'; 
import pptIcon from '../../assets/icons/Audit pdf edited.svg'; 
import wordIcon from '../../assets/icons/Audit pdf edited.svg'; 

interface AuditTrailPanelProps {
  documentId?: string;
}

// Using the more detailed AuditEntry interface from code2
interface AuditEntry {
  id: string;
  action: 'File Created' | 'File Viewed' | 'File Downloaded' | 'File Shared Externally' | 'File Access Revoked' | 'PDF Edited' | 'PPT Edited' | 'Word Edited';
  user: string;
  timestamp: string;
  details?: string;
  icon: string;
}


const getUserActionText = (action: string, user: string): string => {
  if (action.includes('Created')) return `Created by : ${user}`;
  if (action.includes('Viewed')) return `Viewed by : ${user}`;
  if (action.includes('Downloaded')) return `Downloaded by : ${user}`;
  if (action.includes('Shared')) return `Shared by: ${user}`;
  if (action.includes('Revoked')) return `Revoked by: ${user}`;
  if (action.includes('Edited')) return `Edited by: ${user}`;
  return user;
};


const getIconBackgroundColor = (action: string): string => {
  switch (action) {
    case 'File Downloaded':
    case 'File Shared Externally':
    case 'File Access Revoked':
      return '#6C849D17'; // Light gray-blue
    case 'File Created':
    case 'PDF Edited':
    case 'PPT Edited':
    case 'Word Edited':
    case 'File Viewed':
    default:
      return '#F3ECFF'; // Light purple
  }
};

const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({ documentId }) => {
  // Using the A-Z sorting logic from code2
  const [sortOrder, setSortOrder] = useState<'z-a' | 'a-z'>('z-a');

  // Using the more extensive sample data from code2
  const [auditEntries] = useState<AuditEntry[]>([
    { id: '1', action: 'File Created', user: 'Sumit Pawar', timestamp: '10 Dec 2024, 11:35 AM', icon: createIcon },
    { id: '2', action: 'File Viewed', user: 'Sumit Pawar', timestamp: '10 Dec 2024, 11:35 AM', icon: viewedIcon },
    { id: '3', action: 'File Downloaded', user: 'Sumit Pawar', timestamp: '10 Dec 2024, 11:35 AM', icon: downloadIcon },
    { id: '4', action: 'File Shared Externally', user: 'Rohan Mishra', timestamp: '10 Dec 2024, 11:35 AM', details: 'Shared with: adit.maurya@gmail.com, Saif@dmacq.com', icon: sharedIcon },
    { id: '5', action: 'File Access Revoked', user: 'Admin', timestamp: '10 Dec 2024, 11:35 AM', details: 'Access revoked for: test@example.com', icon: revokeIcon },
    { id: '6', action: 'PDF Edited', user: 'Sumit Pawar', timestamp: '10 Dec 2024, 11:35 AM', details: 'Version 3.0', icon: editIcon },
    { id: '7', action: 'PPT Edited', user: 'Sumit Pawar', timestamp: '10 Dec 2024, 11:35 AM', icon: pptIcon },
    { id: '8', action: 'Word Edited', user: 'Sumit Pawar', timestamp: '10 Dec 2024, 11:35 AM', icon: wordIcon },
  ]);

  const formatDate = (dateString: string) => {
    // In a real app with standard ISO strings, you'd format here.
    // For this example, the data is pre-formatted.
    return dateString;
  };

  const sortedEntries = [...auditEntries].sort((a, b) => {
    // Sorting logic from code2 for A-Z
    if (sortOrder === 'a-z') {
      return a.action.localeCompare(b.action);
    }
    return b.action.localeCompare(a.action);
  });

  return (
    <div>
      {/* CSS styles from code1 */}
      <style>{`
        .audit-entry-label {
          color: #40566D;
          font-family: 'Noto Sans', sans-serif;
          font-size: 13px; /* Value font size */
          font-style: normal;
          font-weight: 400;
          line-height: 15px;
        }
        .audit-entry-action {
          color: #192839;
          font-family: 'Noto Sans', sans-serif;
          font-size: 14px; /* Key font size */
          font-style: normal;
          font-weight: 600; /* Key font weight: semi-bold */
          line-height: 15px;
        }
        .audit-entry-date {
          color: #40566D;
          font-family: 'Noto Sans', sans-serif;
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: 15px;
        }
      `}</style>


      <div className="flex justify-between items-center py-3">
        <h3 className="text-[#192839] font-[Noto_Sans] text-[18px] not-italic font-bold leading-normal capitalize">
          Audit Trail
        </h3>
     
        <select
          className="text-gray-600 bg-white outline-none cursor-pointer"
          style={{ fontSize: '14px' }}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'a-z' | 'z-a')}
        >
          <option value="z-a">Z - A</option>
          <option value="a-z">A - Z</option>
        </select>
      </div>
      <Separator className="-mx-5 w-[calc(100%+3rem)] h-px bg-gray-200" />

    
      <div>
        {sortedEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-4"
          
            style={{
              padding: '16px 0px',
              borderBottom: '1px solid rgba(108, 132, 157, 0.09)',
              margin: 0
            }}
          >
            <div
              className="flex justify-center items-center w-9 h-9"
              
              style={{
                padding: 6,
                gap: 8,
                borderRadius: 5,
                border: '1.25px solid rgba(108,132,157,0.09)',
                background: getIconBackgroundColor(entry.action),
                display: 'flex',
                minWidth: 32,
                minHeight: 32
              }}
            >
              <img src={entry.icon} alt={entry.action + ' icon'} className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
               
                <p className="audit-entry-action">{entry.action}</p>
                <span className="audit-entry-date">{formatDate(entry.timestamp)}</span>
              </div>
              <p className="audit-entry-label">
               
                {getUserActionText(entry.action, entry.user)}
              </p>
              {entry.details && (
                <p className="audit-entry-label mt-1">{entry.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrailPanel;
