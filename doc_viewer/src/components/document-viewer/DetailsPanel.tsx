import React, { useState } from "react";
import DetailsPdfIcon from "../../assets/icons/Details pdf icon.svg";
import DetailsFolderIcon from "../../assets/icons/Details folder.svg";
import DetailsSizeIcon from "../../assets/icons/Details -size.svg";
import DetailsCalendarIcon from "../../assets/icons/Details-calendar.svg";
import DetailsLastModifiedIcon from "../../assets/icons/Details- lastmodified.svg";
import DetailsMasterIcon from "../../assets/icons/Blobs icon.svg";
import DetailsDocTypeIcon from "../../assets/icons/Blobs icon.svg";
import person1 from "../../assets/icons/person_1.svg";
import person2 from "../../assets/icons/person_2.svg";
import person3 from "../../assets/icons/person_3.svg";
import person4 from "../../assets/icons/person_4.svg";
import person5 from "../../assets/icons/person_5.svg";
import { Separator } from "@/components/ui/separator";

const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 18L9 12L15 6"
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
      d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
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


const allUsers = [
  {
    id: 1,
    name: "Tim Jennings",
    email: "tim.jennings@example.com",
    avatar: person1,
  },
  {
    id: 2,
    name: "Alice Smith",
    email: "alice.smith@example.com",
    avatar: person2,
  },
  {
    id: 3,
    name: "Eva Garcia",
    email: "eva.garcia@example.com",
    avatar: person3,
  },
  { id: 4, name: "David Lee", email: "david.lee@example.com", avatar: person4 },
  {
    id: 5,
    name: "Sophia Wang",
    email: "sophia.wang@example.com",
    avatar: person5,
  },
  {
    id: 6,
    name: "Eonna Wang",
    email: "eonna.wang@example.com",
    avatar: person2,
  },
  {
    id: 7,
    name: "Ethan Brown",
    email: "ethan.brown@example.com",
    avatar: person3,
  },
  {
    id: 8,
    name: "Olivia Johnson",
    email: "olivia.johnson@example.com",
    avatar: person1,
  },
  {
    id: 9,
    name: "Liam Smith",
    email: "liam.smith@example.com",
    avatar: person4,
  },
];

// --- 1. User Access List Component (With Two-Step Header) ---
interface UserAccessListProps {
  onBack: () => void;
  users: typeof allUsers;
}

const UserAccessList: React.FC<UserAccessListProps> = ({ onBack, users }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackClick = () => {
    // If we are in search mode, the back button should exit search mode.
    if (isSearching) {
      setIsSearching(false);
      setSearchTerm(""); // Also clear the search term
    } else {
      // Otherwise, it should go back to the main details panel.
      onBack();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* --- Conditional Header --- */}
      <div className="flex items-center gap-2 pr-2 py-3">
        <button onClick={handleBackClick} className="p-2 -ml-2">
          <BackIcon />
        </button>

        {isSearching ? (
          // --- Search Bar View ---
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search User"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus // Automatically focus the input when it appears
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-[#192839] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        ) : (
          // --- Title View ---
          <>
            <h3 className="flex-grow text-[#192839] font-[Noto_Sans] text-[17px] font-bold leading-[22px]">
              All users who access this file
            </h3>
            <button onClick={() => setIsSearching(true)} className="p-2">
              <SearchIcon />
            </button>
          </>
        )}

        {/* <button onClick={handleBackClick} className="p-2 -ml-2">
          <CloseIcon />
        </button> */}
      </div>

      <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200" />

      {/* --- User List (Scrollbar Hidden) --- */}
      <div className="flex-grow pt-4 overflow-y-auto no-scrollbar">
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

// --- 2. Main Details Panel Component (Unchanged) ---
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

  // ... (rest of the DetailsPanel component is the same as before)
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
        users={allUsers}
        onBack={() => setIsViewingAllUsers(false)}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* --- Style block with added rule to hide the scrollbar --- */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }

        .details-label { color: #40566D; font-family: 'Noto Sans', sans-serif; font-size: 13px; font-weight: 400; }
        .details-value { color: #192839; font-family: 'Noto Sans', sans-serif; font-size: 14px; font-weight: 500; }
      `}</style>

      <div className="py-3 flex-shrink-0">
        <h3 className="text-[#192839] font-[Noto_Sans] text-[18px] font-bold">
          Details
        </h3>
        <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200 mt-3" />
      </div>
      {/* --- Details Container (Scrollbar Hidden) --- */}
      <div className="flex-grow overflow-y-auto no-scrollbar">
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
            <div className="flex -space-x-2 mt-3">
              {allUsers.slice(0, 5).map((u) => (
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
