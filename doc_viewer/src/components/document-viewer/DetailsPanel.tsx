
import React, { useState ,useEffect} from "react";
import DetailsPdfIcon from "../../assets/icons/Details pdf icon.svg";
import DetailsFolderIcon from "../../assets/icons/Details folder.svg";
import DetailsSizeIcon from "../../assets/icons/Details -size.svg";
import DetailsCalendarIcon from "../../assets/icons/Details-calendar.svg";
import DetailsLastModifiedIcon from "../../assets/icons/Details- lastmodified.svg";
import DetailsMasterIcon from "../../assets/icons/Blobs icon.svg";
import DetailsDocTypeIcon from "../../assets/icons/Blobs icon.svg";
import { Separator } from "@/components/ui/separator";
import {fetchUserSessionAndPermissions} from '../../services/rbacService';

// --- Updated BackIcon Component ---
const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 12H5M12 5L5 12L12 19" 
      stroke="#40566D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667zM14 14l-2.9-2.9"
      stroke="#40566D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    width="24" 
    height="24" 
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="#40566D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface UserAccessListProps {
  onBack: () => void;
  users: User[];
}

const UserAccessList: React.FC<UserAccessListProps> = ({ onBack, users }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exitSearchMode = () => {
    setIsSearching(false);
    setSearchTerm("");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="py-3 flex-shrink-0">
        <h3 className="text-[#192839] font-[Noto_Sans] text-[18px] font-bold px-5">
          Details
        </h3>
        <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200 mt-3" />
      </div>
{/* py-3 */}
      <div className="flex items-center gap-2 pr-2 px-5">
        <button onClick={onBack} className="p-2 -ml-2">
          <BackIcon />
        </button>

        {isSearching ? (
          <>
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search User"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-[#192839] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button onClick={exitSearchMode} className="p-2">
              <CloseIcon />
            </button>
          </>
        ) : (
          <>
            <h3 className="flex-grow text-[#192839] font-[Noto_Sans] text-[16px] font-bold leading-[22px]">
              All users who access this file
            </h3>
            <button onClick={() => setIsSearching(true)} className="p-2">
              <SearchIcon />
            </button>
          </>
        )}
      </div>

      

      <div className="flex-grow py-4 overflow-y-auto no-scrollbar px-5">
        <div className="flex flex-col gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-[#192839] text-[14px] font-medium leading-tight">
                  {user.name}
                </p>
                <p className="text-[#40566D] text-[13px] leading-tight">
                  {user.email}
                </p>
              </div>
            </div>
          ))}
        </div>
        {searchTerm && filteredUsers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[#40566D] font-medium">No Matching Users</p>
            <p className="text-sm text-gray-500">
              Try a different name or email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


interface DetailsPanelProps {
  document: {
    name: string;
    fileType: string;
    size: string;
    location: string;
    createdBy: string;
    uploadedAt: string;
    lastModified: string;
    masterConnected: string;
    docTypeConnected: string;
  };
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ document }) => {
  const [isViewingAllUsers, setIsViewingAllUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const session = await fetchUserSessionAndPermissions();
        console.log("Fetched Users:", session);
        setUsers(session.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const detailRows = [
    { icon: DetailsPdfIcon, label: "File Type", value: document.fileType },
    { icon: DetailsFolderIcon, label: "Location", value: document.location },
    { icon: DetailsSizeIcon, label: "Size", value: document.size },
    {
      icon: DetailsCalendarIcon,
      label: "Created By",
      value: formatDate(document.uploadedAt),
    },
    {
      icon: DetailsLastModifiedIcon,
      label: "Last Modified At",
      value: formatDate(document.lastModified),
    },
    {
      icon: DetailsMasterIcon,
      label: "Master Tagged",
      value: (
        <>
          {document.masterConnected},{" "}
          <span className="text-blue-600 cursor-pointer">+3 Master</span>
        </>
      ),
    },
    {
      icon: DetailsDocTypeIcon,
      label: "DocType Tagged",
      value: (
        <>
          {document.docTypeConnected},{" "}
          <span className="text-blue-600 cursor-pointer">+2 Doctype</span>
        </>
      ),
    },
  ];

  if (isViewingAllUsers) {
    return (
      <UserAccessList 
        users={users}
        onBack={() => setIsViewingAllUsers(false)}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col px-5">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .details-label { color: #40566D; font-family: 'Noto Sans', sans-serif; font-size: 13px; font-weight: 400; }
        .details-value { color: #192839; font-family: 'Noto Sans', sans-serif; font-size: 14px; font-weight: 500; }
      `}</style>

      <div className="py-3 flex-shrink-0">
        <h3 className="text-[#192839] font-[Noto_Sans] text-[18px] font-bold">
          Details
        </h3>
        <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200 mt-3" />
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar ">
        <div className="space-y-6">
          <div className="space-y-4">
            {detailRows.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-[#F5F7FA] rounded flex-shrink-0">
                  <img src={item.icon} alt={item.label} className="w-5 h-5" />
                </div>
                <div className="text-sm min-w-0 flex-1">
                  <p className="details-label">{item.label}</p>
                  <p className="details-value mt-0.5 break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200 mb-4" />
            <div className="flex justify-between items-center">
              <p className="text-[#192839] font-medium text-[14px]">
                Users With Access
              </p>
              <span
                onClick={() => setIsViewingAllUsers(true)}
                className="text-sm text-blue-600 cursor-pointer font-medium"
              >
                View All
              </span>
            </div>
            <div className="flex -space-x-2 mt-3 ">
              {users.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-white flex-shrink-0"
                >

                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
