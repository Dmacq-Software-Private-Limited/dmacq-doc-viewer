import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import createIcon from '../../assets/icons/Audit file created.svg';
import editIcon from '../../assets/icons/Audit pdf edited.svg';
import viewedIcon from '../../assets/icons/Audit file viewed.svg';
import downloadIcon from '../../assets/icons/Audit downloaded.svg';
import sharedIcon from '../../assets/icons/Audit shared.svg';
import revokeIcon from '../../assets/icons/Audit access revoked.svg';
import { fetchUserSessionAndPermissions } from '../../services/rbacService';



interface AuditTrailPanelProps {
  documentId?: string;
}

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
      return '#6C849D17'; 
    case 'File Created':
    case 'PDF Edited':
    case 'PPT Edited':
    case 'Word Edited':
    case 'File Viewed':
    default:
      return '#F3ECFF'; 
  }
};

const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({ documentId }) => {
  const [sortOrder, setSortOrder] = useState<'z-a' | 'a-z'>('z-a');
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const session = await fetchUserSessionAndPermissions();
        console.log("Fetched Session:", session);

        if (session.auditTrail) {
          // Map backend auditTrail into AuditEntry format
          const mapped = session.auditTrail.map((item: any, index: number) => ({
            id: item.id || index.toString(),
            action: mapAction(item.action), // map API action text to your defined labels
            user: item.user,
            timestamp: new Date(item.timestamp).toLocaleString(),
            details: item.details,
            icon: getIconForAction(item.action),
          }));
          console.log("mapped values",mapped);
          setAuditEntries(mapped);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <p>Loading audit trail...</p>;

  const sortedEntries = [...auditEntries].sort((a, b) => {
    if (sortOrder === 'a-z') {
      return a.action.localeCompare(b.action);
    }
    return b.action.localeCompare(a.action);
  });
function mapAction(apiAction: string): AuditEntry["action"] {
  switch (apiAction.toLowerCase()) {
    case "created": return "File Created";
    case "viewed": return "File Viewed";
    case "downloaded": return "File Downloaded";
    case "shared": return "File Shared Externally";
    case "revoked": return "File Access Revoked";
    case "edited": return "PDF Edited"; // you can extend this for PPT/Word
    default: return "File Viewed";
  }
}

function getIconForAction(action: string) {
  switch (action.toLowerCase()) {
    case "created": return createIcon;
    case "viewed": return viewedIcon;
    case "downloaded": return downloadIcon;
    case "shared": return sharedIcon;
    case "revoked": return revokeIcon;
    case "edited": return editIcon;
    default: return viewedIcon;
  }
}

  const formatDate = (dateString: string) => {
    
    return dateString;
  };

 

  return (
    <div className="flex flex-col h-full w-full">
      {/* CSS styles */}
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
      
      {/* HEADER */}
      <div className="w-full py-3">
        <div className="flex justify-between items-center px-5">
          <h3 className="text-[#192839] font-[Noto_Sans] text-[18px] not-italic font-bold leading-normal capitalize">
            Audit Trail
          </h3>
          <select
            className="text-gray-600 bg-white text-sm outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'a-z' | 'z-a')}
          >
            <option value="z-a">Z - A</option>
            <option value="a-z">A - Z</option>
          </select>
        </div>
      </div>
      
      {/* LIST AREA */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <Separator className=" h-px bg-gray-200" />
        <div className="flex-1 space-y-0 pt-3 overflow-y-auto custom-scroll scrollbar-hide">
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-4 px-5 py-5"
              style={{
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
    </div>
  );
};

export default AuditTrailPanel;
