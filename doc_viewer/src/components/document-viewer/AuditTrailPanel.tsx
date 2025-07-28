import React, { useState } from 'react';
import createIcon from '../../assets/icons/Audit file created.svg'
import editIcon from '../../assets/icons/Audit pdf edited.svg'
import viewedIcon from '../../assets/icons/Audit file viewed.svg'
import downloadIcon from '../../assets/icons/Audit downloaded.svg'
import sharedIcon from '../../assets/icons/Audit shared.svg'
interface AuditTrailPanelProps {
  documentId?: string;
}

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  icon: string;
}

const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({ documentId: _documentId }) => {
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  
  const [auditEntries] = useState<AuditEntry[]>([
    {
      id: '1',
      action: 'File Created',
      user: 'Jane Smith',
      timestamp: '2023-12-15T10:30:00Z',
      icon: createIcon
    },
    {
      id: '2',
      action: 'File Viewed',
      user: 'John Doe',
      timestamp: '2023-12-15T11:45:00Z',
      icon: viewedIcon
    },
    {
      id: '3',
      action: 'File Downloaded',
      user: 'Mike Johnson',
      timestamp: '2023-12-15T14:20:00Z',
      icon: downloadIcon
    },
    {
      id: '4',
      action: 'File Shared Externally',
      user: 'Jane Smith',
      timestamp: '2023-12-15T15:30:00Z',
      details: 'Shared with: client@company.com, partner@business.com',
      icon: sharedIcon
    },
    {
      id: '5',
      action: 'PDF Edited',
      user: 'John Doe',
      timestamp: '2023-12-15T16:15:00Z',
      details: 'Added signature on page 2',
      icon: editIcon
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedEntries = [...auditEntries].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div>
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
      
      {/* Header Section */}
      <div className="flex-shrink-0 w-full border-b border-gray-200">
        <div className="flex justify-between items-center py-3 px-5" style={{ padding: '12px 20px' }}>
            <h3 className="text-[#192839] font-[Noto_Sans] text-[18px] not-italic font-bold leading-normal capitalize">
              Audit Trail
            </h3>
            <select
              className="text-gray-600 bg-white outline-none cursor-pointer"
              style={{ fontSize: '14px' }} /* Filter font size */
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>

        </div>
      </div>
      <div>
        {[
          ...sortedEntries.sort((a, b) => {
            const order = [
              'File Created',
              'File Viewed',
              'File Downloaded',
              'File Shared Externally',
              'PDF Edited'
            ];
            return order.indexOf(a.action) - order.indexOf(b.action);
          })
        ].map((entry) => (
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
                background: (entry.action === 'File Downloaded' || entry.action === 'File Shared Externally') ? '#6C849D17' : '#F3ECFF',
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
              <p className="audit-entry-label">{entry.action.includes('Created') ? `Created by : ${entry.user}` : entry.action.includes('Viewed') ? `Viewed by : ${entry.user}` : entry.action.includes('Downloaded') ? `Downloaded by : ${entry.user}` : entry.action.includes('Shared') ? `Shared by: ${entry.user}` : entry.action.includes('Revoked') ? `Revoked by: ${entry.user}` : entry.action.includes('Edited') ? `Edited by: ${entry.user}` : entry.user}</p>
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