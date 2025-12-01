import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import DeleteIcon from '@/assets/icons/Delete.svg';
import DownloadIcon from '@/assets/icons/file_download.svg';
import RestoreIcon from '@/assets/icons/settings_backup_restore.svg';
import RestoreConfirmationModal from './RestoreConfirmationModal';
import DeleteVersionModal from './DeleteVersionModal';
import SuccessToast from '../manage-pdf/SuccessToast';
import { apiService } from '@/services/apiService';

const VersionHistoryPanel: React.FC = () => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [versions, setVersions] = useState([
    {
      id: '1',
      name: 'V1',
      uploader: 'Jitesh Sharma',
      status: '',
      date: '15 June 2025, 10:56AM',
    },
        {
      id: '2',
      name: 'V2',
      uploader: 'Jitesh Sharma',
      status: 'Live',
      date: '12 June 2025, 05:46PM',
    },
  ]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<any>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleMakeLive = (id: string) => {
    setVersions(
      versions.map((version) => ({
        ...version,
        status: version.id === id ? 'Live' : '',
      }))
    );
    setOpenMenuId(null);
  };

  const handleDelete = (version: any) => {
    setVersionToDelete(version);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleRestore = (version: any) => {
    setVersionToRestore(version);
    setShowRestoreModal(true);
    setOpenMenuId(null);
  };

  const handleDownload = async (version: any) => {
    setOpenMenuId(null);
    try {
      const docDetails = await apiService.getDocument(version.id);
      const downloadUrl = apiService.getDocumentDownloadUrl(version.id);
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docDetails.originalName || `${version.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const confirmDelete = () => {
    if (!versionToDelete) return;
    setVersions(versions.filter((v) => v.id !== versionToDelete.id));
    setShowDeleteModal(false);
    setVersionToDelete(null);
    setToastMessage('Version has been deleted successfully.');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const confirmRestore = () => {
    if (!versionToRestore) return;

    const newVersionNumber = versions.length + 1;
    const newVersion = {
      id: `${newVersionNumber}`,
      name: `V${newVersionNumber}`,
      uploader: 'Jitesh Sharma',
      status: 'Live',
      date: new Date().toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
    };
    setVersions(
      versions
        .map((version) => ({
          ...version,
          status: '',
        }))
        .concat(newVersion)
    );
    setShowRestoreModal(false);
    setVersionToRestore(null);
    setToastMessage('Previous version has been live successfully.');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col w-full items-start self-stretch flex-1">
      <h2 className="text-lg font-bold py-3 ">Version History</h2>
        <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200" />
      <ul className="w-full">
        {versions.map((version) => (
          <li key={version.id} className={`flex items-center justify-between py-5 h-20 rounded-lg w-full ${version.status === 'Live' ? 'bg-[#F5F8FF]' : 'hover:bg-[#FFFFF]'}`}>
            <div className="flex items-center gap-4">
              <div className="flex w-10 h-10 p-1 justify-center items-center gap-2.5 rounded-[5px] border-[1.25px] border-[rgba(48,94,255,0.24)] bg-[#E2EAFD]">
                <span className="text-[#192839] font-Noto_Sans text-sm font-medium capitalize">{version.name}</span>
              </div>
              <div>
                <p className="font-semibold">Uploaded By {version.uploader}</p>
                <p className="text-sm text-gray-500">
                  {version.status && <span className="text-green-500 font-bold">{version.status}</span>}
                  {version.status && ' • '}
                  {version.date}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                className={`p-[6px] rounded hover:bg-gray-200 ${openMenuId === version.id ? 'bg-gray-200' : ''}`}
                onClick={() => setOpenMenuId(openMenuId === version.id ? null : version.id)}
              >
                <MoreVertical size={20} />
              </button>
              {openMenuId === version.id && (
                <div className="absolute right-0 py-2 w-[131px] h-[124px] bg-white rounded-md shadow-lg z-10">
                  <ul>
                    <li>
                      <button
                        onClick={() => handleRestore(version)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        <img src={RestoreIcon} alt="Make it live" className="w-4 h-4" />
                        Make it live
                      </button>
                    </li>
                    <li>
                      <a href="#" onClick={() => handleDownload(version)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <img src={DownloadIcon} alt="Download" className="w-4 h-4" />
                        Download
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={() => handleDelete(version)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        <img src={DeleteIcon} alt="Delete" className="w-4 h-4" />
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      {showRestoreModal && (
        <RestoreConfirmationModal
          versionName={versionToRestore.name}
          onCancel={() => setShowRestoreModal(false)}
          onConfirm={confirmRestore}
        />
      )}
      {showDeleteModal && (
        <DeleteVersionModal
          versionName={versionToDelete.name}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
      {showSuccessToast && (
        <SuccessToast
          message={toastMessage}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
};

export default VersionHistoryPanel;
